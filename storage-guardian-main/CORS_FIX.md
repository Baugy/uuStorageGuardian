# CORS Problem - Řešení

## Problém

Backend na `https://bmc.arimodu.dev` nepodporuje CORS pro vaši Netlify doménu `https://storage-guardian.netlify.app`.

Chyba v konzoli:
```
Access to fetch at 'https://bmc.arimodu.dev/api/...' from origin 'https://storage-guardian.netlify.app' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present
```

## Řešení 1: Netlify Functions Proxy (Doporučeno)

Projekt obsahuje Netlify Function, která funguje jako proxy a řeší CORS problém.

### Jak to funguje:
- Frontend volá Netlify Function (`/.netlify/functions/api-proxy`)
- Netlify Function volá backend API
- Netlify Function přidává CORS hlavičky

### Instalace:

1. **Nainstalujte závislosti:**
   ```bash
   npm install
   ```

2. **Deploy na Netlify:**
   - Build automaticky zahrnuje functions
   - Nebo použijte: `netlify deploy --prod`

3. **Environment Variables v Netlify:**
   - `VITE_API_BASE_URL` = `https://bmc.arimodu.dev`
   - `VITE_USE_PROXY` = `true` (nebo nechte prázdné - automaticky se použije na Netlify)

### Jak to poznat:
- Aplikace automaticky detekuje, že je na Netlify
- Použije proxy místo přímého volání API
- CORS chyby zmizí

## Řešení 2: Oprava na Backendu (Ideální)

Kontaktujte správce backendu a požádejte o přidání CORS hlaviček:

```http
Access-Control-Allow-Origin: https://storage-guardian.netlify.app
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

Nebo pro všechny domény (méně bezpečné):
```http
Access-Control-Allow-Origin: *
```

## Řešení 3: Použití Mock Dat

Pokud backend není dostupný, aplikace automaticky použije mock data:
- Nastavte `VITE_USE_MOCK_DATA=true` v Netlify environment variables
- Nebo nechte aplikaci automaticky přepnout při chybě

## Testování

Po nasazení s proxy:
1. Otevřete aplikaci na Netlify
2. Otevřete Developer Tools (F12)
3. Zkontrolujte Network tab - requesty by měly jít na `/.netlify/functions/api-proxy/...`
4. CORS chyby by měly zmizet

## Troubleshooting

### Functions nefungují
- Zkontrolujte, že `netlify/functions/api-proxy.ts` existuje
- Zkontrolujte build logs v Netlify
- Ujistěte se, že máte `@netlify/functions` v dependencies

### Stále vidím CORS chyby
- Zkontrolujte, že `VITE_USE_PROXY` není nastaveno na `false`
- Zkontrolujte, že jste na Netlify doméně (automatická detekce)
- Zkontrolujte Netlify Functions logs




