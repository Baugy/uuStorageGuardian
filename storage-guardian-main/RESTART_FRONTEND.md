# Restart Frontend to Load Environment Variables

## Issue
The frontend is still connecting to `bmc.arimodu.dev` instead of `localhost:8082` because Vite only reads `.env` files when the dev server starts.

## Solution
**Restart the frontend dev server** to load the `.env` file:

1. **Stop the current dev server:**
   - Press `Ctrl+C` in the terminal where `npm run dev` is running
   - Or close the terminal window

2. **Restart the dev server:**
   ```powershell
   cd storage-guardian-main
   npm run dev
   ```

3. **Refresh your browser** (hard refresh: `Ctrl+Shift+R`)

## Current Configuration
Your `.env` file is correctly configured:
```
VITE_API_BASE_URL=http://localhost:8082
VITE_USE_MOCK_DATA=false
```

After restarting, the frontend will:
- ✅ Connect to your local backend at `http://localhost:8082`
- ✅ Use mock authentication (no Keycloak CORS errors)
- ✅ Use real backend data (not mock data)

## Verify It's Working
After restarting, check the browser console. You should see:
- No more requests to `bmc.arimodu.dev`
- Requests going to `localhost:8082`
- Successful API calls (or proper error messages from local backend)
