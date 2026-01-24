# Netlify Deployment Guide

## Rychlý start

### Možnost 1: Drag & Drop (Nejjednodušší)

1. **Build projektu:**
   ```bash
   npm run build
   ```

2. **Jděte na:** https://app.netlify.com/drop

3. **Přetáhněte složku `dist`** do prohlížeče

4. **Hotovo!** Aplikace bude dostupná na URL, kterou vám Netlify poskytne.

### Možnost 2: Netlify CLI

1. **Instalace:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Přihlášení:**
   ```bash
   netlify login
   ```

3. **Deploy:**
   ```bash
   npm run build
   netlify deploy --prod --dir=dist
   ```

### Možnost 3: Git Integration (Doporučeno)

1. **Pushněte kód na GitHub/GitLab/Bitbucket**

2. **V Netlify Dashboard:**
   - Jděte na https://app.netlify.com
   - Klikněte "Add new site" → "Import an existing project"
   - Vyberte váš Git provider a repo
   - Build settings:
     - **Build command:** `npm ci && npm run build`
     - **Publish directory:** `dist`
   - Klikněte "Deploy site"

3. **Automatické deployy:** Každý push do main branch automaticky nasadí novou verzi!

## Environment Variables

Po nasazení nastavte environment variables v Netlify:

1. **Netlify Dashboard** → Váš site → **Site settings** → **Environment variables**

2. **Přidejte:**
   - `VITE_API_BASE_URL` = `https://bmc.arimodu.dev`
   - (Volitelné) `VITE_USE_MOCK_DATA` = `false` (nebo tuto proměnnou nemít)

3. **Důležité:** Po přidání/změně environment variables musíte **znovu deploynout** aplikaci:
   - V Netlify Dashboard: **Deploys** → **Trigger deploy** → **Deploy site**

## Konfigurace

Projekt obsahuje `netlify.toml` s následující konfigurací:

- **Build command:** `npm ci && npm run build`
- **Publish directory:** `dist`
- **Node version:** 18
- **SPA routing:** Všechny routy přesměrovány na `index.html`
- **Security headers:** XSS protection, frame options, atd.
- **Caching:** Optimalizované cache headers pro statické soubory

## Custom Domain

1. **V Netlify Dashboard:**
   - Site settings → **Domain management**
   - Klikněte "Add custom domain"
   - Zadejte vaši doménu
   - Postupujte podle instrukcí pro DNS nastavení

## Branch Deploys

Netlify automaticky nasadí každou branch jako preview:
- **Production:** main/master branch
- **Preview:** všechny ostatní branche

## Build Settings

Pokud potřebujete změnit build settings:

1. **Netlify Dashboard** → Site settings → **Build & deploy**
2. Nebo upravte `netlify.toml` v projektu

## Troubleshooting

### Build fails

- Zkontrolujte, že `package.json` obsahuje správný build script
- Zkontrolujte Node version (mělo by být 18+)
- Podívejte se na build logs v Netlify Dashboard

### Environment variables nefungují

- Ujistěte se, že proměnné začínají s `VITE_` (Vite requirement)
- Po změně proměnných znovu deployněte aplikaci
- Zkontrolujte, že proměnné jsou nastavené pro správný environment (Production/Preview)

### Routing nefunguje (404 errors)

- Zkontrolujte, že `netlify.toml` obsahuje redirect pravidlo `/*` → `/index.html`
- Ujistěte se, že `publish` directory je `dist`

### CORS errors

- Backend musí povolit CORS pro vaši Netlify doménu
- Kontaktujte správce backendu pro přidání vaší domény do CORS whitelist

## Support

Pro více informací: https://docs.netlify.com/



