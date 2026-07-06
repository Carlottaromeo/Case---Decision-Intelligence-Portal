import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { execSync } from "child_process"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, "..")

const PPT_CANDIDATES = [
  "c:\\Users\\CarlottaRomeo\\OneDrive - Digital360\\Desktop\\PRIVATO\\northstar_ai_strategy.pptx",
  "c:\\Users\\CarlottaRomeo\\Downloads\\northstar_ai_strategy.pptx",
]

const PPT_PATH = process.argv[2] || PPT_CANDIDATES.find((p) => fs.existsSync(p))
if (!PPT_PATH) throw new Error("PPTX file not found")

const DATA_QUALITY = {
  unmapped_provisioned: 12,
  provisioned_total: 461,
  outside_rollout: 772,
  provisioning_rate: "37.4",
  outside_pct: "62.6",
  unmapped_not_in_directory: 11,
  unmapped_missing_dept_field: 1,
  unmapped_credits_pct: 0.3,
  cluster_a_gap: 209,
}

const SLIDE10_BULLET =
  "Cross-referenced usage export against employee directory: 12 of 461 provisioned users could not be mapped to a department (11 test accounts, 1 missing dept. field) — 0.3% of total credits; excluded from department views only"

const SLIDE10_NOTES_APPEND =
  " We ran a row-level reconciliation between the two source files. Twelve provisioned IDs don't map cleanly to a business unit — mostly NSF900xxx test accounts. We quantified the impact rather than hiding it. Org-wide KPIs are unaffected in any meaningful way."

const REPLACEMENTS = [
  ["783", "772"],
  ["450", "461"],
  ["63.5%", "62.6%"],
  ["36.5%", "37.4%"],
  ["218 employees", "209 employees"],
  ["the 218 employees", "the 209 employees"],
  [
    "450 of 1,233 employees are provisioned — 783 have never accessed the tools",
    "461 of 1,233 employees are provisioned — 772 have never accessed the tools",
  ],
  ["Why are 783 employees outside the rollout?", "Why are 772 employees outside the rollout?"],
]

function extractZip(pptxPath, destDir) {
  if (fs.existsSync(destDir)) fs.rmSync(destDir, { recursive: true, force: true })
  fs.mkdirSync(destDir, { recursive: true })
  const zipCopy = path.join(destDir, "deck.zip")
  fs.copyFileSync(pptxPath, zipCopy)
  execSync(`powershell -NoProfile -Command "Expand-Archive -Path '${zipCopy.replace(/'/g, "''")}' -DestinationPath '${destDir.replace(/'/g, "''")}\\unzipped' -Force"`, {
    stdio: "inherit",
  })
}

function zipDir(sourceDir, outZip) {
  if (fs.existsSync(outZip)) fs.rmSync(outZip, { force: true })
  execSync(
    `powershell -NoProfile -Command "Compress-Archive -Path '${sourceDir.replace(/'/g, "''")}\\*' -DestinationPath '${outZip.replace(/'/g, "''")}' -Force"`,
    { stdio: "inherit" }
  )
}

function applyReplacements(xml) {
  let out = xml
  for (const [from, to] of REPLACEMENTS) {
    out = out.split(from).join(to)
  }
  return out
}

function escapeXml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

function makeBulletParagraph(text) {
  const safe = escapeXml(text)
  return `<a:p><a:pPr marL="171450" indent="-171450"><a:buChar char="•"/></a:pPr><a:r><a:rPr lang="en-US" sz="1200" dirty="0"/><a:t>${safe}</a:t></a:r></a:p>`
}

function insertSlide10Bullet(xml) {
  if (xml.includes("Cross-referenced usage export against employee directory")) return xml
  const anchor =
    "47 users show unusually high weekly credit consumption — signal direction unknown"
  const idx = xml.indexOf(anchor)
  if (idx === -1) throw new Error("Slide 10 anchor bullet not found")
  const closeP = xml.indexOf("</a:p>", idx)
  if (closeP === -1) throw new Error("Slide 10 paragraph end not found")
  const insertAt = closeP + "</a:p>".length
  return xml.slice(0, insertAt) + makeBulletParagraph(SLIDE10_BULLET) + xml.slice(insertAt)
}

function appendSpeakerNotes(xml) {
  if (xml.includes("row-level reconciliation")) return xml
  const closing = "</p:notes>"
  const idx = xml.lastIndexOf(closing)
  if (idx === -1) throw new Error("Notes closing tag not found")
  const paragraph = `<a:p><a:r><a:rPr lang="en-US" dirty="0"/><a:t>${escapeXml(SLIDE10_NOTES_APPEND)}</a:t></a:r></a:p>`
  return xml.slice(0, idx) + paragraph + xml.slice(idx)
}

// Backup
const backupPath = PPT_PATH.replace(/\.pptx$/i, ".backup.pptx")
if (!fs.existsSync(backupPath)) {
  fs.copyFileSync(PPT_PATH, backupPath)
  console.log("Backup created:", backupPath)
}

const workDir = path.join(root, ".pptx-update-temp")
extractZip(PPT_PATH, workDir)
const unzipped = path.join(workDir, "unzipped")

const slideFiles = fs.readdirSync(path.join(unzipped, "ppt", "slides")).filter((f) => f.endsWith(".xml"))
for (const file of slideFiles) {
  const fp = path.join(unzipped, "ppt", "slides", file)
  let xml = fs.readFileSync(fp, "utf8")
  xml = applyReplacements(xml)
  if (file === "slide10.xml") xml = insertSlide10Bullet(xml)
  fs.writeFileSync(fp, xml, "utf8")
}

const notesDir = path.join(unzipped, "ppt", "notesSlides")
if (fs.existsSync(notesDir)) {
  for (const file of fs.readdirSync(notesDir).filter((f) => f.endsWith(".xml"))) {
    const fp = path.join(notesDir, file)
    let notes = fs.readFileSync(fp, "utf8")
    notes = applyReplacements(notes)
    if (file === "notesSlide10.xml") notes = appendSpeakerNotes(notes)
    fs.writeFileSync(fp, notes, "utf8")
  }
}

const outZip = path.join(workDir, "updated.zip")
zipDir(unzipped, outZip)
fs.copyFileSync(outZip, PPT_PATH)

// Also update Downloads copy if we edited OneDrive version
const alt = PPT_CANDIDATES.find((p) => p !== PPT_PATH && fs.existsSync(path.dirname(p)))
if (alt && path.resolve(alt) !== path.resolve(PPT_PATH)) {
  fs.copyFileSync(PPT_PATH, alt)
  console.log("Synced copy:", alt)
}

console.log("✓ PPTX updated:", PPT_PATH)
