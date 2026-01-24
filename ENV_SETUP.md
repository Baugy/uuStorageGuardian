# Environment Variables Setup

## Základní konfigurace

Vytvořte soubor `.env` v kořenovém adresáři projektu:

```env
# API Configuration
VITE_API_BASE_URL=https://bmc.arimodu.dev

# Use mock data instead of real API (set to 'true' to use mock data)
VITE_USE_MOCK_DATA=false
```

## Možnosti konfigurace

### 1. Použití skutečného backendu (výchozí)

```env
VITE_API_BASE_URL=https://bmc.arimodu.dev
VITE_USE_MOCK_DATA=false
```

Nebo jednoduše nechte proměnné prázdné - výchozí hodnoty se použijí automaticky.

### 2. Použití pouze mock dat (bez backendu)

```env
VITE_USE_MOCK_DATA=true
```

Aplikace pak nebude volat backend API a použije pouze mock data.

### 3. Automatický fallback

Pokud `VITE_USE_MOCK_DATA` není nastaveno na `true`, ale backend není dostupný, aplikace automaticky přepne na mock data.

## Lokální vývoj bez backendu

Pro rychlý vývoj bez nutnosti mít běžící backend:

1. Vytvořte `.env` soubor
2. Přidejte `VITE_USE_MOCK_DATA=true`
3. Spusťte `npm run dev`

Aplikace poběží s mock daty a můžete testovat všechny funkce UI.



