# Storage Guardian - IoT Storage Monitoring

Frontend aplikace pro monitoring skladových boxů s IoT senzory.

## 🌐 Live Demo

**Aplikace je nasazena na:** [https://storage-guardian.netlify.app/](https://storage-guardian.netlify.app/)

Aplikace aktuálně používá mock data pro demonstraci funkcionality.

## Technologie

- **Vite** - Build tool
- **TypeScript** - Type safety
- **React** - UI framework
- **React Query** - Data fetching a caching
- **shadcn-ui** - UI komponenty
- **Tailwind CSS** - Styling

## Backend API

Aplikace je připojena k backendu na: `https://bmc.arimodu.dev/`

## Lokální vývoj

### Požadavky

- Node.js 18+ a npm

### Instalace a spuštění

```bash
# 1. Klonování repozitáře
git clone <YOUR_GIT_URL>

# 2. Navigace do projektu
cd storage-guardian-main

# 3. Instalace závislostí
npm install

# 4. Vytvoření .env souboru (volitelné, pokud chcete změnit API URL)
cp .env.example .env

# 5. Spuštění dev serveru
npm run dev
```

Aplikace poběží na `http://localhost:8080`

## Konfigurace

### API URL

API URL lze změnit pomocí environment proměnné `VITE_API_BASE_URL` v souboru `.env`:

```env
VITE_API_BASE_URL=https://bmc.arimodu.dev
```

### Použití Mock Dat (bez backendu)

Aplikace může běžet **bez backendu** pomocí mock dat. Máte dvě možnosti:

#### 1. Explicitní přepnutí na mock data

Vytvořte soubor `.env` a přidejte:

```env
VITE_USE_MOCK_DATA=true
```

Aplikace pak bude používat pouze mock data a nebude se pokoušet připojit k backendu.

#### 2. Automatický fallback

Pokud backend není dostupný (network error, CORS, atd.), aplikace automaticky přepne na mock data. To znamená, že můžete spustit aplikaci i když backend není dostupný - automaticky se použijí mock data.

**Poznámka:** Mock data jsou pouze pro čtení a testování. Změny (editace boxů, přidání zařízení) se neuloží, když používáte mock data.

## Build pro produkci

```bash
npm run build
```

Výstup bude v adresáři `dist/`.

## Nasazení na cloud

### Vercel

1. Nainstalujte Vercel CLI: `npm i -g vercel`
2. Přihlaste se: `vercel login`
3. Deploy: `vercel`
4. Nebo propojte GitHub repo s Vercel přes webové rozhraní

Vercel automaticky detekuje `vercel.json` konfiguraci.

**Environment proměnné v Vercel:**
- V Settings → Environment Variables přidejte `VITE_API_BASE_URL` s hodnotou `https://bmc.arimodu.dev`

### Netlify

Pro detailní instrukce viz **[NETLIFY_SETUP.md](./NETLIFY_SETUP.md)**

**Rychlý start:**
1. Build: `npm run build`
2. Drag & drop složku `dist` na https://app.netlify.com/drop
3. Nebo použijte Netlify CLI: `netlify deploy --prod --dir=dist`
4. Nebo propojte GitHub repo s Netlify přes webové rozhraní

Netlify automaticky detekuje `netlify.toml` konfiguraci.

**Environment proměnné v Netlify:**
- V Site settings → Environment variables přidejte `VITE_API_BASE_URL` s hodnotou `https://bmc.arimodu.dev`
- Po změně proměnných znovu deployněte aplikaci

### Jiné platformy

Aplikace je statický SPA, takže lze nasadit na jakýkoliv hosting podporující statické soubory:
- GitHub Pages
- Cloudflare Pages
- AWS S3 + CloudFront
- Azure Static Web Apps
- atd.

Ujistěte se, že:
1. Build příkaz: `npm run build`
2. Output adresář: `dist`
3. Všechny routy přesměrujte na `index.html` (SPA routing)

## API Endpoints

Aplikace očekává následující API endpointy:

- `GET /api/boxes` - Seznam všech boxů
- `GET /api/boxes/:id` - Detail boxu
- `PUT /api/boxes/:id` - Aktualizace boxu
- `GET /api/boxes/:id/history?hours=24` - Historie měření
- `GET /api/devices` - Seznam zařízení
- `GET /api/devices/:id` - Detail zařízení
- `POST /api/devices` - Vytvoření zařízení
- `DELETE /api/devices/:id` - Smazání zařízení
- `GET /api/warehouses` - Seznam skladů

## Struktura projektu

```
src/
  ├── components/     # React komponenty
  ├── pages/         # Stránky aplikace
  ├── lib/
  │   ├── api/       # API klient a konfigurace
  │   └── mockData.ts # Type definice
  └── hooks/         # React hooky
```

## License

MIT
