# Testing Backend Connection

## Jak otestovat připojení k backendu

### 1. V aplikaci (nejjednodušší)

1. Otevřete nasazenou aplikaci na Netlify
2. Na hlavní stránce uvidíte **API Connection Status** kartu
3. Zkontrolujte status každého API endpointu:
   - ✅ Zelená = připojeno
   - ❌ Červená = chyba
   - ⏳ Šedá = načítání

4. Klikněte na tlačítko **"Test All Endpoints"** pro detailní test

### 2. V prohlížeči (Developer Tools)

1. Otevřete aplikaci v prohlížeči
2. Stiskněte `F12` nebo `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
3. Jděte na záložku **Network** (Síť)
4. Obnovte stránku (`F5`)
5. Hledejte requesty na:
   - `https://bmc.arimodu.dev/api/boxes`
   - `https://bmc.arimodu.dev/api/devices`
   - `https://bmc.arimodu.dev/api/warehouses`

**Co kontrolovat:**
- Status kód: `200` = OK, `404` = Not Found, `500` = Server Error
- CORS chyby: Pokud vidíte "CORS policy" error, backend nepodporuje CORS z vaší domény

### 3. Přímo v konzoli prohlížeče

Otevřete konzoli (`F12` → Console) a zadejte:

```javascript
// Test boxes endpoint
fetch('https://bmc.arimodu.dev/api/boxes')
  .then(r => r.json())
  .then(data => console.log('✅ Boxes API:', data))
  .catch(err => console.error('❌ Error:', err));

// Test devices endpoint
fetch('https://bmc.arimodu.dev/api/devices')
  .then(r => r.json())
  .then(data => console.log('✅ Devices API:', data))
  .catch(err => console.error('❌ Error:', err));
```

### 4. Z terminálu (curl)

```bash
# Test boxes
curl https://bmc.arimodu.dev/api/boxes

# Test devices
curl https://bmc.arimodu.dev/api/devices

# Test warehouses
curl https://bmc.arimodu.dev/api/warehouses
```

### 5. Kontrola Environment Variables v Netlify

1. Jděte na Netlify Dashboard
2. Vyberte váš site
3. Jděte na **Site settings** → **Environment variables**
4. Zkontrolujte, že máte nastaveno:
   - `VITE_API_BASE_URL` = `https://bmc.arimodu.dev`
   - `VITE_USE_MOCK_DATA` = `false` (nebo vůbec nemít tuto proměnnou)

**Důležité:** Po změně environment variables musíte znovu deploynout aplikaci!

### 6. Kontrola mock módu

Pokud vidíte žlutý alert "Mock Mode" na hlavní stránce, znamená to, že:
- `VITE_USE_MOCK_DATA=true` je nastaveno
- Aplikace používá mock data místo skutečného API

Pro vypnutí mock módu:
1. V Netlify: Odstraňte nebo nastavte `VITE_USE_MOCK_DATA=false`
2. Redeploy aplikaci

## Časté problémy

### CORS Error
```
Access to fetch at 'https://bmc.arimodu.dev/api/boxes' from origin 'https://your-site.netlify.app' has been blocked by CORS policy
```

**Řešení:** Backend musí povolit CORS pro vaši doménu. Kontaktujte správce backendu.

### Network Error / Failed to fetch
- Backend není dostupný
- Špatná URL
- Firewall blokuje připojení

**Řešení:** Zkontrolujte, že backend běží a je přístupný.

### 404 Not Found
- Endpoint neexistuje
- Špatná cesta k API

**Řešení:** Zkontrolujte, že backend má správné endpointy.

### Mock data se používají místo API
- `VITE_USE_MOCK_DATA=true` je nastaveno
- Nebo backend není dostupný a aplikace automaticky přepnula na mock data

**Řešení:** Zkontrolujte environment variables a dostupnost backendu.



