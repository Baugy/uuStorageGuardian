# Backend Setup Guide

## Current Status

✅ **Databases Running:**
- PostgreSQL: `localhost:5432` (user: `bmc`, password: `pass`, database: `bmc`)
- InfluxDB: `localhost:8181`

✅ **Backend Configuration:**
- Application configured in `box-manager-core/src/main/resources/application.yml`
- Database connections set to localhost
- CORS configured for `http://localhost:5173`

## Next Steps: Install Java and Build Backend

### 1. Install Java 21 (Required)

The backend has been configured to use **Java 21 LTS** (Long Term Support).

**Installation Steps:**
1. Download Java 21 from: https://adoptium.net/temurin/releases/?version=21
   - Select Windows x64
   - Download the JDK installer (.msi)
2. Run the installer and follow the prompts
3. Verify installation:
   ```powershell
   java -version
   ```
   Should show: `openjdk version "21.x.x"`

**Note:** The project has been updated to use Java 21 instead of Java 25 for better compatibility.

### 2. Build the Backend

Once Java is installed, run:

```powershell
cd box-manager-core
.\mvnw.cmd clean install
```

### 3. Start the Backend

```powershell
cd box-manager-core
.\mvnw.cmd spring-boot:run
```

Or if you have a built JAR:
```powershell
java -jar target/box-manager-core-*.jar
```

The backend will start on `http://localhost:8082`

### 4. Configure Frontend

Create a `.env` file in `storage-guardian-main/`:

```env
VITE_API_BASE_URL=http://localhost:8082
VITE_USE_MOCK_DATA=false
```

Then restart the frontend dev server.

## Quick Start (If Java is Already Installed)

```powershell
# Navigate to backend
cd box-manager-core

# Build
.\mvnw.cmd clean install

# Run
.\mvnw.cmd spring-boot:run
```

## Troubleshooting

- **Java not found**: Install Java 25 or update pom.xml to use Java 21
- **Port 8082 already in use**: Change port in `application.yml`
- **Database connection failed**: Ensure Docker containers are running (`docker ps`)
- **CORS errors**: Check that `http://localhost:5173` is in allowed-origins in `application.yml`

