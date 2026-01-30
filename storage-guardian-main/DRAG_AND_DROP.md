# Drag & Drop Deploy na Netlify

## Rychlý návod

### 1. Build projektu
```bash
npm run build
```

### 2. Deploy na Netlify
1. Jděte na: **https://app.netlify.com/drop**
2. Přetáhněte složku **`dist`** do prohlížeče
3. Hotovo! Aplikace bude dostupná na URL, kterou vám Netlify poskytne

### 3. Nastavení Environment Variables

Po nasazení:

1. **Netlify Dashboard** → Váš site → **Site settings** → **Environment variables**
2. Přidejte:
   - `VITE_API_BASE_URL` = `https://bmc.arimodu.dev`
   - (Volitelné) `VITE_USE_MOCK_DATA` = `false`

3. **Důležité:** Po přidání environment variables:
   - Jděte na **Deploys** → **Trigger deploy** → **Deploy site**
   - Nebo znovu přetáhněte složku `dist`

## Poznámka o CORS

**Drag & drop deploy** nasadí pouze statické soubory. Netlify Functions (pro CORS proxy) se nasadí pouze přes:
- Git deployment (automaticky)
- Netlify CLI (`netlify deploy --prod`)

**Pokud máte CORS problémy po drag & drop:**
- Aplikace automaticky použije mock data jako fallback
- Nebo použijte Git deployment pro plnou funkcionalitu s proxy

## Co je v dist složce

- `index.html` - hlavní HTML soubor
- `assets/` - CSS a JS soubory
- Všechny potřebné soubory pro běh aplikace

## Další deployy

Po každé změně:
1. `npm run build`
2. Přetáhněte novou složku `dist` na Netlify

Nebo použijte Git deployment pro automatické deployy!




