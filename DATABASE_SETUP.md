# Database Setup and Data Preservation

This guide explains how to set up databases and preserve data for your teammate.

## Database Structure

### PostgreSQL (Relational Data)
- **Location:** Docker container `postgre-postgresql-1`
- **Port:** 5432
- **Database:** `bmc`
- **Username:** `bmc`
- **Password:** `pass`

**Data includes:**
- Warehouses
- Devices
- Boxes
- User assignments

### InfluxDB (Time Series Data)
- **Location:** Docker container `influxdb3`
- **Port:** 8181
- **Database:** `bmc`
- **Organization:** `bmc-org`
- **Token:** `bmc-token` (development only)

**Data includes:**
- Temperature and humidity measurements
- Historical sensor data

## Automatic Setup

When your teammate starts the backend for the first time:

1. **Database migrations run automatically** - Creates all tables and schema
2. **Seed data is inserted** - Populates warehouses, devices, and boxes
3. **No manual setup required** - Everything happens on first backend startup

## Manual Database Setup (If Needed)

### PostgreSQL

```powershell
# Start PostgreSQL
cd box-manager-core/docker/postgre
docker-compose up -d

# Wait a few seconds, then verify
docker exec postgre-postgresql-1 psql -U bmc -d bmc -c "SELECT COUNT(*) FROM bmc.t_box;"
```

### InfluxDB

```powershell
# Start InfluxDB
cd box-manager-core/docker/influx
docker-compose up -d

# Verify it's running
docker ps | findstr influxdb3
```

## Data Preservation

### PostgreSQL Data Backup

**To backup:**
```powershell
docker exec postgre-postgresql-1 pg_dump -U bmc bmc > backup.sql
```

**To restore:**
```powershell
docker exec -i postgre-postgresql-1 psql -U bmc bmc < backup.sql
```

### InfluxDB Data

InfluxDB data is stored in `box-manager-core/docker/influx/influxdb3-data/`. This directory is mounted as a Docker volume, so data persists between container restarts.

**Note:** The InfluxDB data directory is excluded from git (see `.gitignore`). Your teammate will start with an empty InfluxDB, which is fine for development.

## Seed Data

Seed data is automatically inserted from:
- `box-manager-core/src/main/resources/db/migration/005_seed_data.sql`

This includes:
- 4 Warehouses
- 6+ Devices
- 11+ Boxes with various configurations

## Adding More Data

### Add More Devices

```powershell
cd box-manager-core
.\scripts\add_more_devices.ps1
```

### Add Measurements (Optional)

```powershell
cd box-manager-core
.\scripts\populate_measurements.ps1
```

**Note:** Measurements require InfluxDB to be properly configured with authentication. For development, the backend provides default values when InfluxDB is unavailable.

## Database Migrations

Migrations are located in:
- `box-manager-core/src/main/resources/db/migration/`

They run automatically in order:
1. `001_schema.sql` - Creates database schema
2. `002_tables.sql` - Creates tables
3. `003_inserts.sql` - Inserts initial data
4. `004_alters.sql` - Applies alterations
5. `005_seed_data.sql` - Seeds sample data

## For Your Teammate

Your teammate should:
1. Start Docker Desktop
2. Start PostgreSQL and InfluxDB containers
3. Start the backend (migrations run automatically)
4. All data will be created automatically

No manual database setup or data import needed!
