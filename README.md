# Storage Guardian - IoT Monitoring System

A full-stack application for monitoring temperature and humidity in storage boxes using IoT devices.

## 🚀 Quick Start

See [SETUP_COMPLETE.md](./SETUP_COMPLETE.md) for detailed setup instructions.

### Prerequisites
- Docker Desktop
- Java 21 JDK
- Node.js (v18+)

### Quick Setup

1. **Start Databases:**
   ```powershell
   cd box-manager-core/docker/postgre
   docker-compose up -d
   cd ../influx
   docker-compose up -d
   ```

2. **Start Backend:**
   ```powershell
   cd box-manager-core
   .\start-backend-dev.ps1
   ```

3. **Start Frontend:**
   ```powershell
   cd storage-guardian-main
   npm install
   # Create .env file with: VITE_API_BASE_URL=http://localhost:8082
   npm run dev
   ```

4. **Access Application:**
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:8082

## 📁 Project Structure

```
storage-guardian-main/
├── box-manager-core/          # Backend (Spring Boot)
│   ├── src/
│   │   └── main/
│   │       ├── java/          # Java source code
│   │       └── resources/
│   │           ├── application.yml
│   │           └── db/migration/  # Database migrations
│   ├── docker/                # Docker compose files
│   └── scripts/               # Utility scripts
│
└── storage-guardian-main/     # Frontend (React + Vite)
    ├── src/
    │   ├── components/        # React components
    │   ├── pages/            # Page components
    │   └── lib/              # Utilities and API client
    └── package.json
```

## 🛠️ Technology Stack

### Backend
- **Framework:** Spring Boot 3.x
- **Language:** Java 21
- **Database:** PostgreSQL (relational data)
- **Time Series DB:** InfluxDB 3 (measurements)
- **Build Tool:** Maven

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **UI Library:** Shadcn/ui + Tailwind CSS
- **State Management:** TanStack Query
- **Routing:** React Router

## 📊 Features

- **Dashboard:** Overview of all storage boxes with real-time status
- **Box Management:** View, edit, and monitor storage boxes
- **Device Management:** (Operator only) Manage IoT devices and sensors
- **History Tracking:** View temperature and humidity trends over time
- **Alerts:** Real-time alerts for out-of-range conditions
- **User Roles:** User and Operator accounts with different permissions

## 🔐 Authentication

The application supports two account types:

- **User Account:** Can view boxes and their own data
- **Operator Account:** Can manage devices and all boxes

**Local Development:**
- Authentication is disabled in `dev` profile
- Auto-login with test credentials
- Switch between accounts from user menu

## 🗄️ Database Setup

### PostgreSQL
- **Port:** 5432
- **Database:** `bmc`
- **Username:** `bmc`
- **Password:** `pass`

Migrations run automatically on backend startup.

### InfluxDB
- **Port:** 8181
- **Database:** `bmc`
- **Organization:** `bmc-org`
- **Token:** `bmc-token` (development only)

## 📝 Scripts

### Backend
- `start-backend-dev.ps1` - Start backend with dev profile
- `scripts/populate_measurements.ps1` - Add sample measurements
- `scripts/add_more_devices.ps1` - Add more devices

### Frontend
- `start-frontend.ps1` - Start frontend dev server
- `restart-dev.ps1` - Restart frontend

### Full Stack
- `start-fullstack.ps1` - Start both backend and frontend

## 🔧 Configuration

### Backend Configuration
Edit `box-manager-core/src/main/resources/application.yml`

### Frontend Configuration
Create `storage-guardian-main/.env`:
```env
VITE_API_BASE_URL=http://localhost:8082
VITE_USE_MOCK_DATA=false
```

## 🐛 Troubleshooting

See [SETUP_COMPLETE.md](./SETUP_COMPLETE.md) for detailed troubleshooting guide.

Common issues:
- **Port conflicts:** Check if ports 8080, 8082, 5432, 8181 are available
- **Docker not running:** Start Docker Desktop
- **Java not found:** Install Java 21 and set JAVA_HOME
- **CORS errors:** Ensure backend is running with dev profile

## 📚 Documentation

- [SETUP_COMPLETE.md](./SETUP_COMPLETE.md) - Complete setup guide
- [SETUP_BACKEND.md](./SETUP_BACKEND.md) - Backend-specific setup
- [QUICK-START.md](./storage-guardian-main/QUICK-START.md) - Quick start guide

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

[Add your license here]

## 👥 Team

- [Your name]
- [Teammate name]

---

**Note:** This project uses the `dev` profile for local development, which disables authentication. For production, ensure proper security configuration.
