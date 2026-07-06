# Northstar Dashboard — AI Adoption & Investment Hub

Prototipo MVP per monitorare l'adozione AI, mappare opportunità di processo e prioritizzare investimenti.

## Requisiti

- [Node.js](https://nodejs.org/) 18 o superiore
- npm

## Avvio in locale

```bash
npm install
npm run dev
```

Apri l'URL indicato nel terminale (di solito `http://localhost:5173`).

## Accesso

**Requisito:** il tool si apre sempre dalla pagina di login. Non c'è accesso automatico né sessione salvata tra una visita e l'altra: a ogni apertura (o refresh) l'utente deve cliccare **Login**.

In schermata di accesso clicca **Login** — non serve password in questo prototipo.

## Dati sorgente

I file dati vanno in `public/`:

- `northstar_ai_usage_export.csv`
- `northstar_employee_directory_1233_v2.xlsx` (se manca, caricabile da Data Quality)

## Script utili

| Comando | Descrizione |
|---------|-------------|
| `npm run dev` | Server di sviluppo |
| `npm run build` | Build produzione in `dist/` |
| `npm run preview` | Anteprima della build |
| `npm run verify-sources` | Verifica file sorgente in `public/` |

## Repository

GitHub: [Carlottaromeo/Case---Northstar-Financial](https://github.com/Carlottaromeo/Case---Northstar-Financial)
