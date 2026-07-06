const DB_NAME = "northstar-source-data"
const DB_VERSION = 1
const FILES_STORE = "files"
const LOG_STORE = "log"

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onerror = () => reject(req.error)
    req.onsuccess = () => resolve(req.result)
    req.onupgradeneeded = (e) => {
      const db = e.target.result
      if (!db.objectStoreNames.contains(FILES_STORE)) {
        db.createObjectStore(FILES_STORE, { keyPath: "id" })
      }
      if (!db.objectStoreNames.contains(LOG_STORE)) {
        const log = db.createObjectStore(LOG_STORE, { keyPath: "id", autoIncrement: true })
        log.createIndex("timestamp", "timestamp", { unique: false })
      }
    }
  })
}

async function withStore(storeName, mode, fn) {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode)
    const store = tx.objectStore(storeName)
    const result = fn(store)
    tx.oncomplete = () => resolve(result)
    tx.onerror = () => reject(tx.error)
  })
}

export async function loadStoredFile(fileId) {
  return withStore(FILES_STORE, "readonly", (store) => {
    return new Promise((resolve, reject) => {
      const req = store.get(fileId)
      req.onsuccess = () => resolve(req.result ?? null)
      req.onerror = () => reject(req.error)
    })
  })
}

export async function saveStoredFile(record) {
  return withStore(FILES_STORE, "readwrite", (store) => {
    store.put(record)
  })
}

export async function loadUpdateLog(limit = 50) {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(LOG_STORE, "readonly")
    const store = tx.objectStore(LOG_STORE)
    const index = store.index("timestamp")
    const req = index.openCursor(null, "prev")
    const entries = []
    req.onsuccess = (e) => {
      const cursor = e.target.result
      if (cursor && entries.length < limit) {
        entries.push(cursor.value)
        cursor.continue()
      } else {
        resolve(entries)
      }
    }
    req.onerror = () => reject(req.error)
  })
}

export async function appendUpdateLog(entry) {
  return withStore(LOG_STORE, "readwrite", (store) => {
    store.add({
      ...entry,
      timestamp: entry.timestamp ?? new Date().toISOString(),
    })
  })
}
