# Complete Setup Guide for Storage Guardian

This guide will help you set up the entire application from scratch with all databases and data.

## Prerequisites

1. **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop/)
2. **Java 21 JDK** - [Download from Adoptium](https://adoptium.net/temurin/releases/?version=21)
3. **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
4. **Git** - [Download here](https://git-scm.com/)

## Step 1: Clone the Repository

```bash
git clone <repository-url>
cd storage-guardian-main
```

## Step 2: Start Docker Desktop

Make sure Docker Desktop is running before proceeding. You can verify with:
```powershell
docker ps
```

## Step 3: Start Databases (PostgreSQL & InfluxDB)

### Start PostgreSQL

```powershell
cd box-manager-core/docker/postgre
docker-compose up -d
```

Wait a few seconds for PostgreSQL to initialize, then verify:
```powershell
docker ps
```
You should see a container named `postgre-postgresql-1` running.

### Start InfluxDB

```powershell
cd box-manager-core/docker/influx
docker-compose up -d
```

Verify InfluxDB is running:
```powershell
docker ps
```
You should see a container named `influxdb3` running.

## Step 4: Set Up PostgreSQL Database

The database schema and seed data will be automatically created when the backend starts. However, if you want to manually set it up:

```powershell
# Connect to PostgreSQL
$containerName = "postgre-postgresql-1"
docker exec -it $containerName psql -U bmc -d bmc

# Or run migrations manually (they run automatically on backend startup)
```

**Database Credentials:**
- Host: `localhost:5432`
- Database: `bmc`
- Username: `bmc`
- Password: `pass`

## Step 5: Set Up Backend

### Install Java 21

1. Download Java 21 from [Adoptium](https://adoptium.net/temurin/releases/?version=21)
2. Install it (default location: `C:\Program Files\Eclipse Adoptium\jdk-21.0.9.10-hotspot`)
3. Verify installation:
   ```powershell
   java -version
   ```

### Configure Java Environment (if needed)

Update the `start-backend-dev.ps1` script with your Java installation path if different.

### Start Backend

**Option 1: Using the script (Recommended)**
```powershell
cd box-manager-core
.\start-backend-dev.ps1
```

**Option 2: Manual start**
```powershell
cd box-manager-core
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.9.10-hotspot"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
$env:SPRING_PROFILES_ACTIVE = "dev"
.\mvnw.cmd spring-boot:run
```

The backend will:
- Automatically run database migrations
- Populate seed data (warehouses, devices, boxes)
- Start on `http://localhost:8082`

**Note:** The backend uses the `dev` profile which disables authentication for local development.

## Step 6: Set Up Frontend

### Install Dependencies

```powershell
cd storage-guardian-main
npm install
```

### Configure Environment

Create a `.env` file in `storage-guardian-main/`:

```env
VITE_API_BASE_URL=http://localhost:8082
VITE_USE_MOCK_DATA=false
```

### Start Frontend

**Option 1: Using the script**
```powershell
.\start-frontend.ps1
```

**Option 2: Manual start**
```powershell
cd storage-guardian-main
npm run dev
```

The frontend will start on `http://localhost:8080`

## Step 7: Verify Setup

1. **Backend Health Check:**
   - Open: http://localhost:8082/actuator/health
   - Should return: `{"status":"UP"}`

2. **Frontend:**
   - Open: http://localhost:8080
   - Should show the StorageGuardian dashboard
   - Auto-login should work (test account)

3. **Database Data:**
   - Check that boxes and devices are visible in the UI
   - You should see sample warehouses, devices, and boxes

## Step 8: Populate Additional Data (Optional)

If you want to add more sample devices:

```powershell
cd box-manager-core
.\scripts\add_more_devices.ps1
```

## Quick Start (After Initial Setup)

Once everything is set up, you can use the convenience scripts:

```powershell
# Start everything
.\start-fullstack.ps1

# Or start separately
.\start-backend.ps1    # Backend only
.\start-frontend.ps1   # Frontend only
```

## Database Data Preservation

### PostgreSQL Data

PostgreSQL data is stored in Docker volumes. To preserve data:

1. **Backup:**
   ```powershell
   docker exec postgre-postgresql-1 pg_dump -U bmc bmc > backup.sql
   ```

2. **Restore:**
   ```powershell
   docker exec -i postgre-postgresql-1 psql -U bmc bmc < backup.sql
   ```

### InfluxDB Data

InfluxDB data is stored in `box-manager-core/docker/influx/influxdb3-data/`. This directory is mounted as a volume, so data persists between container restarts.

## Troubleshooting

### Backend Issues

**Port 8082 already in use:**
```powershell
# Find process using port 8082
netstat -ano | findstr :8082
# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

**Database connection failed:**
- Verify Docker containers are running: `docker ps`
- Check PostgreSQL is accessible: `docker exec postgre-postgresql-1 psql -U bmc -d bmc -c "SELECT 1;"`

**Java not found:**
- Verify Java installation: `java -version`
- Update `JAVA_HOME` in `start-backend-dev.ps1` if needed

### Frontend Issues

**Still connecting to remote backend:**
- Verify `.env` file exists in `storage-guardian-main/`
- Restart the dev server after creating/updating `.env`
- Check browser console for API URL logs

**CORS errors:**
- Ensure backend is running with `dev` profile
- Check `application.yml` has `http://localhost:8080` in `cors.allowed-origins`

### Database Issues

**Migrations not running:**
- Backend automatically runs migrations on startup
- Check backend logs for migration status
- Manual migration: Run SQL files in `box-manager-core/src/main/resources/db/migration/` in order

**No data showing:**
- Seed data runs automatically on first startup
- Check database: `docker exec postgre-postgresql-1 psql -U bmc -d bmc -c "SELECT COUNT(*) FROM bmc.t_box;"`

## Development Notes

- **Backend runs on:** `http://localhost:8082`
- **Frontend runs on:** `http://localhost:8080`
- **Dev profile:** Authentication is disabled for local development
- **Auto-login:** Frontend automatically logs in with test credentials
- **Operator account:** Switch to operator account from user menu to access device management

## Account Types

- **User Account:** Can view boxes and their own data
- **Operator Account:** Can manage devices and all boxes
  - Switch to operator: Click user avatar → "Switch to Operator"
  - Credentials: `operator` / `operator`

## Next Steps

1. Explore the dashboard at http://localhost:8080
2. Switch to operator account to access device management
3. Browse boxes and devices
4. Check the API status indicator on the dashboard

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review backend logs for errors
3. Check browser console for frontend errors
4. Verify all Docker containers are running
