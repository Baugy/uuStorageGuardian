# Deployment Guide

## Možnost 1: Netlify - Drag & Drop (Nejjednodušší)

1. **Build projektu:**
   ```bash
   npm run build
   ```

2. **Jděte na:** https://app.netlify.com/drop

3. **Přetáhněte složku `dist`** do prohlížeče

4. **Nastavte Environment Variables:**
   - V Netlify dashboardu: Site settings → Environment variables
   - Přidejte: `VITE_API_BASE_URL` = `https://bmc.arimodu.dev`
   - Nebo pro mock data: `VITE_USE_MOCK_DATA` = `true`

5. **Hotovo!** Aplikace bude dostupná na URL, kterou vám Netlify poskytne.

## Možnost 2: Netlify CLI

1. **Instalace a přihlášení:**
   ```bash
   npm install -g netlify-cli
   netlify login
   ```

2. **Deploy:**
   ```bash
   npm run build
   netlify deploy --prod --dir=dist
   ```

3. **Nastavte Environment Variables** (stejně jako v Možnosti 1)

## Možnost 3: Git + Netlify (Doporučeno pro dlouhodobý vývoj)

1. **Vytvořte Git repo:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Pushněte na GitHub/GitLab:**
   - Vytvořte nový repo na GitHub
   - Pushněte kód:
   ```bash
   git remote add origin <YOUR_GIT_URL>
   git push -u origin main
   ```

3. **Propojte s Netlify:**
   - Jděte na https://app.netlify.com
   - Klikněte "New site from Git"
   - Vyberte GitHub a váš repo
   - Build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Environment variables:
     - `VITE_API_BASE_URL` = `https://bmc.arimodu.dev`

4. **Automatické deployy:** Každý push do main branch automaticky nasadí novou verzi!

## Možnost 4: Vercel (Alternativa)

1. **Instalace:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Nebo přes web:** https://vercel.com → New Project → Upload folder `dist`

## Environment Variables

Pro produkci nastavte v Netlify/Vercel:

- `VITE_API_BASE_URL` = `https://bmc.arimodu.dev` (pro skutečný backend)
- Nebo `VITE_USE_MOCK_DATA` = `true` (pro mock data bez backendu)

**Důležité:** Po změně environment variables musíte znovu deploynout aplikaci!




