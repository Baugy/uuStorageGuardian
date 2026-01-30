# ⚠️ IMPORTANT: Restart Dev Server to Use Local Backend

## The Problem
Your frontend is still connecting to `https://bmc.arimodu.dev` instead of `http://localhost:8082` because **Vite only reads `.env` files when the dev server starts**.

## The Solution

### Option 1: Use the Restart Script (Easiest)
```powershell
cd C:\Users\Lukas\Downloads\storage-guardian-main\storage-guardian-main
.\restart-dev.ps1
```

### Option 2: Manual Restart
1. **Stop the current dev server:**
   - Find the terminal window running `npm run dev`
   - Press `Ctrl+C` to stop it
   - Or close the terminal window

2. **Verify .env file exists:**
   ```powershell
   cd C:\Users\Lukas\Downloads\storage-guardian-main\storage-guardian-main
   Get-Content .env
   ```
   Should show:
   ```
   VITE_API_BASE_URL=http://localhost:8082
   VITE_USE_MOCK_DATA=false
   ```

3. **Start the dev server:**
   ```powershell
   npm run dev
   ```

4. **Verify it's working:**
   - Refresh your browser (hard refresh: `Ctrl+Shift+R`)
   - Open browser console (F12)
   - Look for: `✅ Using local backend: http://localhost:8082`
   - Check Network tab - requests should go to `localhost:8082`

## Why This Happens
Vite reads environment variables from `.env` files **only when the dev server starts**. If you:
- Created/updated the `.env` file while the server was running
- Started the server before creating the `.env` file

Then the server won't see the environment variables until you restart it.

## Verification
After restarting, you should see in the browser console:
```
🔧 API Configuration: {
  'VITE_API_BASE_URL (env)': 'http://localhost:8082',
  'API_BASE_URL (resolved)': 'http://localhost:8082',
  ...
}
✅ Using local backend: http://localhost:8082
```

If you see `❌ ERROR: Using fallback API URL!`, the `.env` file isn't being read - check the file location and restart again.
