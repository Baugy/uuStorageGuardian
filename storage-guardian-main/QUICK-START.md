# Quick Start Guide - Full Stack Application

## Option 1: Start Both (Easiest)
Run this from the project root:
```powershell
.\start-fullstack.ps1
```
This will start both backend and frontend in separate windows.

## Option 2: Start Separately

### Start Backend Only
```powershell
.\start-backend.ps1
```
Or manually:
```powershell
cd box-manager-core
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.9.10-hotspot"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
.\mvnw.cmd spring-boot:run
```

### Start Frontend Only
```powershell
.\start-frontend.ps1
```
Or manually:
```powershell
cd storage-guardian-main
npm run dev
```

## URLs
- **Frontend:** http://localhost:8080
- **Backend API:** http://localhost:8082
- **Backend Health:** http://localhost:8082/actuator/health

## Prerequisites
1. **Docker Desktop** - Must be running (for PostgreSQL and InfluxDB)
2. **Java 21** - Installed and JAVA_HOME set
3. **Node.js** - Installed (for npm)

## Troubleshooting

### Backend won't start
- Check Docker Desktop is running
- Verify Java 21 is installed: `java -version`
- Check PostgreSQL and InfluxDB containers are running: `docker ps`

### Frontend still connects to remote backend
- Make sure `.env` file exists in `storage-guardian-main/`
- Restart the dev server after creating/updating `.env`
- Check browser console for `🔧 API Configuration:` log

### Port already in use
- Backend (8082): Stop any process using port 8082
- Frontend (8080): Stop any process using port 8080
