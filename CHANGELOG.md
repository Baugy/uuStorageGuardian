# Changelog

All notable changes to the Storage Guardian project will be documented in this file.

## [Unreleased] - 2026-01-31

### Added
- **Complete Full-Stack Application**
  - Backend: Spring Boot application with PostgreSQL and InfluxDB integration
  - Frontend: React + Vite application with modern UI components
  - Docker configurations for PostgreSQL and InfluxDB
  - Database migrations with automatic seed data

- **Authentication & Authorization**
  - User and Operator account types
  - Account switching feature (switch between user and operator without re-login)
  - Mock authentication for local development
  - Dev profile that disables authentication for easier development

- **Box Management**
  - Box list with filtering, sorting, and search
  - Box detail view with real-time temperature and humidity
  - Box editing (temperature/humidity limits, description, etc.)
  - Box history with charts and trends
  - Expandable rows in box list for quick details
  - Status badges (OK, WARNING, CRITICAL)

- **Device Management** (Operator only)
  - Device list with statistics
  - Device registration
  - Device assignment to boxes
  - Device status tracking
  - Advanced filtering and sorting
  - Expandable rows for device details

- **Dashboard**
  - Overview with box statistics
  - Active alerts timeline
  - Quick stats sidebar
  - API status indicator
  - Real-time data refresh

- **UI/UX Improvements**
  - Modern, commercial design with elegant styling
  - Responsive layout for all screen sizes
  - Navigation bar with active state highlighting
  - Breadcrumb navigation
  - Toast notifications for user feedback
  - Loading states and error handling
  - Dark theme support

- **Developer Experience**
  - Comprehensive setup documentation
  - PowerShell scripts for easy startup
  - Database migration system
  - Seed data for development
  - Error handling and logging
  - Dev mode with graceful fallbacks

### Changed
- Updated Java version from 25 to 21 LTS for better compatibility
- Improved error handling for InfluxDB connection issues
- Enhanced box service to provide default values when measurements unavailable
- Updated frontend to handle null/undefined values gracefully
- Improved CORS configuration for local development

### Fixed
- Fixed compilation errors (main method signature, variable name conflicts)
- Fixed 401/403 authentication errors in dev mode
- Fixed 500 errors from InfluxDB connection failures
- Fixed box detail page data structure mismatches
- Fixed box editing not saving temperature/humidity limits
- Fixed React key warnings in lists
- Fixed null status badge errors
- Fixed device list 500 errors
- Fixed multiple boxes per device query errors

### Technical Details

#### Backend Improvements
- Added `dev` Spring profile that disables authentication
- Implemented graceful error handling for InfluxDB queries
- Added default temperature/humidity values based on box type in dev mode
- Fixed authentication checks to work with dev profile
- Improved null safety throughout service layer

#### Frontend Improvements
- Added operator account switching UI
- Enhanced navigation with device browser link
- Improved data fetching with proper error handling
- Added mock data fallback for development
- Fixed all TypeScript type issues

#### Database
- Automatic migrations on backend startup
- Seed data includes:
  - 4 Warehouses
  - 22+ Devices (with various types)
  - 14+ Boxes with different configurations
- Data preservation through Docker volumes

## Setup & Configuration

### Initial Setup
- Created comprehensive setup documentation
- Added Docker Compose configurations
- Created PowerShell startup scripts
- Configured environment variables

### Database Setup
- PostgreSQL for relational data (warehouses, devices, boxes)
- InfluxDB for time-series measurements
- Automatic schema creation and seeding
- Data persistence through Docker volumes

## Development Features

### Local Development Mode
- Authentication disabled in `dev` profile
- Mock JWT tokens for local development
- Default measurement values when InfluxDB unavailable
- CORS configured for localhost development

### Scripts & Utilities
- `start-backend-dev.ps1` - Start backend with dev profile
- `start-frontend.ps1` - Start frontend dev server
- `start-fullstack.ps1` - Start both backend and frontend
- `scripts/populate_measurements.ps1` - Add sample measurements
- `scripts/add_more_devices.ps1` - Add more devices to database

## Known Issues

- InfluxDB authentication not fully configured (using placeholder token)
- Measurement data shows "N/A" when InfluxDB is unavailable (handled gracefully with defaults)
- Some devices may have multiple boxes assigned (handled gracefully)

## Future Improvements

- Configure proper InfluxDB authentication
- Add real-time WebSocket updates
- Implement user management UI
- Add more advanced analytics and reporting
- Add export functionality for data
- Implement proper backup/restore procedures

---

## Commit History

### Commit 1: Initial commit
- Full-stack Storage Guardian application
- Documentation and configuration files

### Commit 2: Add complete application code
- Backend Spring Boot application
- Frontend React application
- Database migrations
- Docker configurations

### Commit 3: Add git setup instructions
- Git setup guide
- Repository structure documentation

### Commit 4: Fix frontend files
- Removed nested git repository
- Properly added all frontend files
