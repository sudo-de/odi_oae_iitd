# IITD Transport Management System

A comprehensive full-stack application for managing IIT Delhi transport operations, built with React (Web), React Native (Mobile), NestJS, and MongoDB.

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Available Scripts](#-available-scripts)
- [API Endpoints](#-api-endpoints)
- [Technology Stack](#️-technology-stack)
- [Usage Examples](#-usage-examples)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)

## 🚀 Features

### 👥 User Management
- **Multi-role System**: Admin, Staff, Driver, and Student roles
- **Role-based Access Control**: 
  - **Web App**: Admin and Staff only
  - **Mobile App**: Student and Driver only
- **Bulk Operations**: Import/export users, bulk status updates
- **Profile Management**: User profiles with photos, entry numbers, programmes, departments, hostels
- **Verification System**: Driver verification with expiry dates and status tracking
- **QR Code Generation**: Automated QR codes for drivers

### 🚗 Ride Management
- **Ride Locations**: Predefined routes with from/to locations and fare pricing
- **Ride Booking**: Students can book rides by selecting from and to locations
- **Ride Bills**: Track ride transactions with status (completed, pending, cancelled)
- **Bill Statistics**: Revenue tracking, average fare, min/max fare analysis
- **Bill History**: View all ride bills with filtering and status indicators

### 🔐 Security & Authentication
- **JWT Authentication**: Secure token-based authentication
- **Device Tracking**: Monitor active device sessions
- **Password Security**: bcrypt hashing with validation
- **Role-based Access**: Granular permissions system
- **Client Type Validation**: Enforces role restrictions based on client type (web/mobile)

### 💾 Data Management
- **Automatic Backups**: Scheduled JSON exports with email notifications
- **Data Export/Import**: Bulk data operations for users, ride locations, and bills
- **Cache Management**: System performance optimization
- **Statistics Dashboard**: Real-time data insights

### 📧 Email Notifications
- **SMTP Integration**: Gmail SMTP with app password support
- **Backup Alerts**: Automated email notifications for completed backups
- **Admin Communications**: Targeted notifications to administrators

### 📱 Mobile App Features
- **Cross-platform**: iOS and Android support via Expo
- **Theme Support**: Light/Dark mode with persistent preferences
- **Profile Management**: View and manage user profiles
- **QR Code Display**: Drivers can view and generate QR codes
- **Ride Booking**: Students can book rides with location selection
- **Bill Viewing**: View ride bills with status indicators
- **Settings**: Profile, password, theme, notifications, and more

### 📱 Device Management
- **Session Monitoring**: Track active user devices and locations
- **Security Overview**: Device activity in system information dashboard

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Web     │    │   NestJS API    │    │   MongoDB       │
│   (Vite)        │◄──►│   Server        │◄──►│   Database      │
│   :5173         │    │   :3000         │    │   :27017        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
┌─────────────────┐              │                       │
│  React Native   │              │                       │
│  (Expo)         │◄─────────────┘                       │
│  Mobile App     │                                      │
└─────────────────┘                                      │
         │                                               │
         ▼                                               ▼
┌─────────────────┐    ┌─────────────────┐    ┌──────────────────┐
│  File Storage   │    │  Email Service  │    │   Collections    │
│  (Local/Cloud)  │◄──►│   (SMTP)        │◄──►│   - Users        │
└─────────────────┘    └─────────────────┘    │   - RideLocations│
                                              │   - RideBills    │
                                              └──────────────────┘
```

## 📁 Project Structure

```
├── client/                      # React Web Frontend (Admin/Staff)
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminDashboard/  # Main dashboard interface
│   │   │   │   ├── components/   # UI components
│   │   │   │   │   ├── Settings.tsx     # System settings
│   │   │   │   │   ├── UserManagement.tsx # User CRUD
│   │   │   │   │   └── ...
│   │   │   │   └── styles/       # CSS styles
│   │   │   ├── Login/            # Login component
│   │   │   └── Sidebar.tsx       # Navigation sidebar
│   │   └── main.tsx
│   └── package.json
│
├── mobile/                      # React Native Mobile App (Student/Driver)
│   ├── components/
│   │   ├── Login.tsx             # Mobile login
│   │   ├── Dashboard.tsx        # Main dashboard with tabs
│   │   └── Settings.tsx          # Settings screen
│   ├── context/
│   │   └── ThemeContext.tsx      # Theme management
│   ├── services/
│   │   └── api.ts                # API client
│   ├── assets/
│   │   └── logo.png              # App logo
│   ├── App.tsx                   # Root component
│   └── package.json
│
├── server/                      # NestJS Backend
│   ├── src/
│   │   ├── auth/                # Authentication module
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── strategies/jwt.strategy.ts
│   │   ├── users/               # User management module
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   └── users.module.ts
│   │   ├── ride-locations/      # Ride location routes
│   │   │   ├── ride-locations.controller.ts
│   │   │   ├── ride-locations.service.ts
│   │   │   └── dto/
│   │   ├── ride-bills/          # Ride bill management
│   │   │   ├── ride-bills.controller.ts
│   │   │   ├── ride-bills.service.ts
│   │   │   └── dto/
│   │   ├── data-management/     # Backup & data management
│   │   │   ├── data-management.controller.ts
│   │   │   └── data-management.service.ts
│   │   ├── email/               # Email service module
│   │   │   └── email.module.ts
│   │   ├── services/            # Shared services
│   │   │   └── email.service.ts
│   │   └── schemas/             # MongoDB schemas
│   │       ├── user.schema.ts
│   │       ├── ride-location.schema.ts
│   │       └── ride-bill.schema.ts
│   ├── uploads/                 # File storage
│   └── package.json
│
├── infra/                       # Infrastructure & Deployment
│   ├── docker/                  # Docker configurations
│   ├── k8s/                     # Kubernetes manifests
│   ├── terraform/               # Infrastructure as Code
│   └── argocd/                  # ArgoCD configurations
│
├── ARCHITECTURE.md              # Detailed system architecture
└── package.json                 # Root package manager
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or cloud instance)
- **Git** (for cloning the repository)
- **Expo CLI** (for mobile development): `npm install -g expo-cli`

### Database Setup

This project uses an external MongoDB instance. You can use:
- **MongoDB Atlas** (cloud): https://www.mongodb.com/cloud/atlas
- **Self-hosted MongoDB**: Your own MongoDB server
- **Local MongoDB** (for development): Install and run locally

**For Local Development (Optional):**
```bash
# macOS with Homebrew
brew install mongodb-community
brew services start mongodb-community

# Ubuntu/Debian
sudo apt-get install mongodb
sudo systemctl start mongodb

# Windows
# Download and install from mongodb.com
```

**Note:** For Docker deployments, you must provide `MONGODB_URI` as an environment variable pointing to your external MongoDB instance.

### Environment Configuration

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd iitd
   ```

2. **Configure environment variables**:

   **Server Environment** (`.env` in `/server` directory):
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/iitd-db

   # JWT Authentication
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=1d

   # Email Configuration (Gmail SMTP)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-gmail-app-password
   SMTP_FROM=IITD System <your-email@gmail.com>

   # Application
   NODE_ENV=development
   PORT=3000
   ```

   **Gmail App Password Setup**:
   - Go to [Google Account Settings](https://myaccount.google.com/)
   - Enable 2-Factor Authentication
   - Generate an App Password for "Mail"
   - Use the 16-character password (no spaces) as `SMTP_PASS`

### Installation

Install dependencies for all projects:

```bash
# Install all dependencies
npm run install:all

# Or install individually:
cd client && npm install
cd ../server && npm install
cd ../mobile && npm install
```

### Development

Run all services in development mode:

```bash
npm run dev
```

This will start:
- **React Web Client**: http://localhost:5173 (Admin/Staff)
- **NestJS Server**: http://localhost:3000
- **MongoDB**: localhost:27017

### Running Individual Services

#### Web Client Only
```bash
npm run dev:client
# Or: cd client && npm run dev
```

#### Server Only
```bash
npm run dev:server
# Or: cd server && npm run dev
```

#### Mobile App Only
```bash
cd mobile && npm start
# Or use Expo commands:
npm run android    # Android emulator
npm run ios        # iOS simulator
npm run web        # Web browser
```

### Testing

Run end-to-end tests with Playwright:

```bash
# Run all tests (headless)
npm test

# Run tests with visible browser
npm run test:headed

# Interactive test runner
npm run test:ui

# Debug mode for test development
npm run test:debug

# View test reports
npm run test:report
```

**Note**: Tests automatically start the development server if not running.

### Production Build

Build and start the application:

```bash
# Build both client and server
npm run build

# Start production server
npm start
```

### CI/CD with GitHub Actions

The project includes automated CI/CD workflows for the server:

**Workflows:**
- **`server-ci.yml`**: Comprehensive CI pipeline with linting, testing, building, Docker image building, security scanning, and deployment
- **`server-docker.yml`**: Dedicated Docker build and push workflow

**Features:**
- ✅ Automatic linting on every push/PR
- ✅ Unit, integration, and e2e tests with MongoDB service
- ✅ Test coverage reporting with Codecov
- ✅ Docker image building and pushing (supports Docker Hub and GitHub Container Registry)
- ✅ Multi-platform builds (linux/amd64, linux/arm64)
- ✅ Security scanning with Trivy
- ✅ Automated deployment to production (on main branch)

**Workflow Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`
- Manual workflow dispatch
- Changes to `server/**` directory

**Required Secrets:**
The workflows automatically detect and use Docker Hub if secrets are configured:
- **`DOCKER_USERNAME`**: Docker Hub username (optional - uses GitHub Container Registry if not set)
- **`DOCKER_PASSWORD`**: Docker Hub password/token (optional - uses GitHub Container Registry if not set)

If Docker Hub secrets are not set, workflows will use GitHub Container Registry (ghcr.io) automatically.

See [`.github/SECRETS.md`](.github/SECRETS.md) for detailed secrets documentation.

**View Workflow Status:**
- Go to the "Actions" tab in GitHub repository
- Check workflow runs and their status
- View logs and test results

### Docker Deployment

The server includes Docker support for easy deployment and development.

#### Using Docker Compose (Recommended)

**Production:**
```bash
cd server
docker-compose up -d
```

**Development:**
```bash
cd server
docker-compose -f docker-compose.dev.yml up
```

#### Manual Docker Build

**Build the image:**
```bash
cd server
docker build -t iitd-server:latest .
```

**Run the container:**
```bash
docker run -d \
  --name iitd-server \
  -p 3000:3000 \
  -e MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/iitd-db \
  -e JWT_SECRET=your-secret-key \
  -v $(pwd)/uploads:/app/uploads \
  -v $(pwd)/backups:/app/backups \
  iitd-server:latest
```

**Note:** This setup requires an external MongoDB instance. Provide your MongoDB connection string via the `MONGODB_URI` environment variable.

#### Docker Compose Services

The `docker-compose.yml` includes:
- **Server**: NestJS application with health checks
- **Networks**: Isolated network for service communication
- **Volumes**: Persistent storage for uploads and backups

**Note:** This setup uses an external MongoDB instance. You must provide `MONGODB_URI` as an environment variable.

**Environment Variables:**
Create a `.env` file in the `server` directory or set environment variables:

```env
# Database - REQUIRED: External MongoDB connection string
# Examples:
# MONGODB_URI=mongodb://username:password@host:port/database
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# JWT Authentication
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=1d

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=IITD System <noreply@iitd.ac.in>
```

**Setup External MongoDB:**

**Option 1: Environment Variable**
```bash
# Set MONGODB_URI before running docker-compose
export MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/iitd-db
docker-compose up -d
```

**Option 2: .env File**
```bash
# Create .env file with MONGODB_URI
cd server
echo "MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/yourdatabase" > .env
docker-compose up -d
```

**Important:** The `MONGODB_URI` environment variable is **required** and must be set before starting the server.

### First-Time Setup

1. **Start the application** in development mode
2. **Access the web interface** at http://localhost:5173 (Admin/Staff login)
3. **Create admin/staff users** through the registration process
4. **Create student/driver users** via the admin dashboard
5. **Configure ride locations** with from/to routes and fares
6. **Configure backup settings** in the Settings page
7. **Test mobile app** by logging in with student/driver credentials
8. **Test email notifications** by creating a backup

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both client and server in development mode |
| `npm run dev:client` | Start only the React client (:5173) |
| `npm run dev:server` | Start only the NestJS server (:3000) |
| `npm run build` | Build both client and server for production |
| `npm run build:client` | Build only the React client |
| `npm run build:server` | Build only the NestJS server |
| `npm run start` | Start the server in production mode |
| `npm run install:all` | Install dependencies for all projects |
| `npm run test` | Run Playwright end-to-end tests |
| `npm run test:client` | Run client tests only |
| `npm run test:server` | Run all server tests (Vitest, Supertest, Pact, k6) |
| `npm run test:server:unit` | Run server unit tests only |
| `npm run test:server:integration` | Run server integration tests only |
| `npm run test:server:e2e` | Run server e2e tests only |
| `npm run test:server:contract` | Run server contract tests only |
| `npm run test:server:load` | Run server load tests only |
| `npm run test:server:coverage` | Generate server test coverage |

### Docker Commands

| Command | Description |
|---------|-------------|
| `docker-compose up -d` | Start server and MongoDB in production mode |
| `docker-compose -f docker-compose.dev.yml up` | Start in development mode with hot reload |
| `docker-compose down` | Stop and remove containers |
| `docker-compose logs -f server` | View server logs |
| `docker-compose ps` | List running containers |
| `docker build -t iitd-server:latest .` | Build Docker image manually |

## 🔌 API Endpoints

### Authentication
```
POST   /auth/login              # User login (with clientType: 'web' or 'mobile')
POST   /auth/forgot-password     # Request password reset
POST   /auth/reset-password     # Reset password with token
GET    /auth/profile            # Get current user profile (JWT)
GET    /auth/devices            # Get device information (JWT)
```

**Login Role Restrictions**:
- **Web**: Only Admin and Staff roles allowed
- **Mobile**: Only Student and Driver roles allowed

### User Management
```
GET    /users                   # Get all users (JWT)
GET    /users/:id               # Get user by ID (JWT)
POST   /users                   # Create new user (JWT, multipart)
PATCH  /users/:id               # Update user (JWT)
DELETE /users/:id               # Delete user (JWT)
PATCH  /users/:id/status        # Toggle user active status (JWT)
PATCH  /users/:id/role          # Update user role (JWT)
POST   /users/bulk-update       # Bulk update users (JWT)
GET    /users/stats/overview    # Get user statistics (JWT)
```

### QR Code Management
```
POST   /users/:id/generate-qr           # Generate QR for driver (JWT)
POST   /users/drivers/generate-qr-codes # Generate QR for all drivers (JWT)
```

### Ride Locations
```
GET    /ride-locations          # Get all ride locations (JWT)
GET    /ride-locations/:id      # Get ride location by ID (JWT)
POST   /ride-locations          # Create new ride location (JWT)
PATCH  /ride-locations/:id      # Update ride location (JWT)
DELETE /ride-locations/:id      # Delete ride location (JWT)
```

### Ride Bills
```
GET    /ride-bills              # Get all ride bills (JWT)
GET    /ride-bills/stats        # Get ride bill statistics (JWT)
GET    /ride-bills/:id          # Get ride bill by ID (JWT)
POST   /ride-bills              # Create new ride bill (JWT)
PATCH  /ride-bills/:id          # Update ride bill (JWT)
DELETE /ride-bills/:id          # Delete ride bill (JWT)
```

### Data Management & Backup
```
GET    /data-management/stats           # Get data statistics (JWT)
POST   /data-management/backup          # Create manual backup (JWT)
GET    /data-management/backups         # Get backup history (JWT)
POST   /data-management/backup/settings # Update backup settings (JWT)
GET    /data-management/backup/settings # Get backup settings (JWT)
POST   /data-management/export          # Export data (JWT)
POST   /data-management/import          # Import data (JWT)
POST   /data-management/cache/clear     # Clear system cache (JWT)
```

### System Information
```
GET    /                    # Hello World
GET    /health              # Health check
GET    /app/info            # Application information
```

## 🛠️ Technology Stack

### Frontend (React Web - Admin/Staff)
- **Framework**: React 19 with Hooks
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: CSS Modules with custom design system
- **HTTP Client**: Fetch API (native)
- **State Management**: React useState/useEffect
- **Code Quality**: ESLint
- **UI Components**: Custom component library

### Mobile App (React Native - Student/Driver)
- **Framework**: React Native 0.81.5 with Expo ~54.0
- **Language**: TypeScript
- **Platform**: iOS, Android, Web
- **State Management**: React Context API
- **Storage**: AsyncStorage for token and theme persistence
- **HTTP Client**: Axios with interceptors
- **UI Components**: Custom components with theme support
- **Features**: QR Code generation, Theme switching (Light/Dark)

### Backend (NestJS)
- **Framework**: NestJS 11
- **Language**: TypeScript
- **Runtime**: Node.js 18+
- **HTTP Server**: Express (via @nestjs/platform-express)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with Passport.js
- **File Upload**: Multer
- **Validation**: Class Validator + Class Transformer
- **Configuration**: @nestjs/config

### Database & Storage
- **Primary Database**: MongoDB
- **ODM**: Mongoose
- **Collections**: Users, RideLocations, RideBills
- **File Storage**: Local filesystem (uploads/)
- **GridFS**: Large file storage in MongoDB
- **Backup Format**: JSON exports

### Email & Notifications
- **Email Service**: Nodemailer
- **SMTP Provider**: Gmail SMTP
- **Authentication**: App passwords (OAuth ready)
- **Templates**: HTML with responsive design

### Security & Authentication
- **Password Hashing**: bcrypt
- **JWT Tokens**: Secure authentication
- **CORS**: Configured for web/mobile
- **Input Validation**: DTO-based validation
- **File Security**: Type and size validation
- **Role-based Access Control**: Client-type validation (web/mobile)

### Development Tools
- **Version Control**: Git
- **Package Manager**: npm
- **Code Quality**: ESLint + Prettier
- **Testing**: Jest (framework ready)
- **Documentation**: Comprehensive README + ARCHITECTURE.md

### Infrastructure
- **Development**: Local MongoDB + filesystem
- **Production Ready**: Environment-based configuration
- **Deployment**: Docker-ready architecture
- **Monitoring**: Health checks + logging
- **Containerization**: Docker support with multi-stage builds
- **Docker Compose**: Production and development configurations
- **CI/CD**: GitHub Actions workflows for automated testing and deployment
- **Orchestration**: Kubernetes manifests
- **IaC**: Terraform configurations
- **GitOps**: ArgoCD for continuous deployment

### Testing & Quality Assurance
- **E2E Testing**: Playwright framework (Client)
- **Unit Testing**: Vitest framework (Server)
- **Integration Testing**: Supertest (Server)
- **Contract Testing**: Pact framework (Server)
- **Load Testing**: k6 framework (Server)
- **Test Browsers**: Chromium, Firefox, WebKit, Mobile Safari, Chrome
- **API Testing**: Built-in HTTP request testing
- **Visual Testing**: Screenshot and trace capture
- **Performance Testing**: Response time and throughput analysis
- **CI/CD Integration**: Parallel test execution across all layers

## 📖 Usage Examples

### Creating a New User
```typescript
// Frontend - Create user with profile photo
const formData = new FormData();
formData.append('name', 'John Doe');
formData.append('email', 'john@example.com');
formData.append('password', 'securepassword');
formData.append('role', 'driver');
formData.append('profilePhoto', imageFile);

const response = await fetch('/users', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: formData
});
```

### Login with Role-based Access
```typescript
// Web Client - Admin/Staff only
const response = await fetch('/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@iitd.ac.in',
    password: 'password',
    clientType: 'web'  // Required for web access
  })
});

// Mobile App - Student/Driver only
const response = await fetch('/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'student@iitd.ac.in',
    password: 'password',
    clientType: 'mobile'  // Required for mobile access
  })
});
```

### Creating a Ride Location
```typescript
// Create a new ride route
const response = await fetch('/ride-locations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  },
  body: JSON.stringify({
    fromLocation: 'IIT Main Gate',
    toLocation: 'IIT Hospital',
    fare: 50
  })
});
```

### Booking a Ride (Student)
```typescript
// Create a ride bill
const response = await fetch('/ride-bills', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  },
  body: JSON.stringify({
    rideId: `RIDE-${Date.now()}`,
    studentId: currentUser.id,
    studentName: currentUser.name,
    studentEntryNumber: currentUser.entryNumber,
    driverId: selectedDriver.id,
    driverName: selectedDriver.name,
    location: `${fromLocation} → ${toLocation}`,
    fare: selectedFare,
    date: new Date().toISOString(),
    time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    status: 'pending'
  })
});
```

### Generating QR Code for Driver
```typescript
// Generate QR code for driver
const response = await fetch(`/users/${driverId}/generate-qr`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` }
});

const { qrCode } = await response.json();
// qrCode contains base64 data URL
```

### Creating a System Backup
```typescript
// Trigger manual backup
const response = await fetch('/data-management/backup', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` }
});

const { message, filename, stats } = await response.json();
// Backup created with email notification sent
```

## 🔧 Troubleshooting

### Common Issues

**MongoDB Connection Failed**
```bash
# Check if MongoDB is running
brew services list | grep mongodb

# Start MongoDB
brew services start mongodb-community
```

**Email Notifications Not Working**
- Verify Gmail app password is correct
- Check SMTP settings in `.env`
- Ensure 2FA is enabled on Gmail account
- Test with a simple email client first

**File Upload Issues**
- Check `uploads/` directory permissions
- Verify file size limits in server config
- Ensure supported file types

**JWT Token Expired**
- Refresh the page to re-authenticate
- Check JWT expiration time in `.env`

**Mobile App Issues**
- Ensure Expo CLI is installed: `npm install -g expo-cli`
- Clear Expo cache: `expo start -c`
- Reset Metro bundler: `npx react-native start --reset-cache`
- Check that server is running and accessible from mobile device/emulator

**Role-based Access Errors**
- Verify `clientType` is included in login request ('web' or 'mobile')
- Ensure user role matches client type:
  - Web: Admin or Staff
  - Mobile: Student or Driver
- Check server logs for detailed error messages

**Docker Issues**
- Ensure Docker and Docker Compose are installed
- Check container logs: `docker-compose logs server`
- Verify MongoDB connection: `docker-compose exec server node -e "console.log(process.env.MONGODB_URI)"`
- Restart services: `docker-compose restart`
- Clean rebuild: `docker-compose down -v && docker-compose up --build`

### Environment Variables

Create `.env` file in `/server` directory:
```env
# Required
MONGODB_URI=mongodb://localhost:27017/iitd-db
JWT_SECRET=your-super-secret-key-here

# Optional (with defaults)
JWT_EXPIRES_IN=1d
NODE_ENV=development
PORT=3000

# Email (required for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
```

## 📊 System Features

### Web Dashboard (Admin/Staff)
- **Real-time Statistics**: User counts, active sessions, ride statistics
- **System Health**: Database status, server uptime
- **Quick Actions**: Create users, generate reports, manage ride locations
- **User Management**: CRUD operations, bulk updates, role management
- **Ride Management**: Create/edit ride locations, view ride bills
- **Data Management**: Backups, exports, imports, cache management

### Mobile Dashboard (Student/Driver)
- **Profile Tab**: View profile information, verification status, expiry dates
- **QR Code Tab** (Drivers): Display and generate QR codes
- **Ride Tab** (Students): Book rides by selecting from/to locations
- **Bills Tab**: View ride bills with status indicators
- **Settings Tab**: Profile, password, theme, notifications, logout
- **Theme Support**: Light/Dark mode with persistent preferences

### User Management
- **Role-based Access**: Admin, Staff, Driver, Student permissions
- **Bulk Operations**: Import/export, mass updates
- **Profile Management**: Photos, entry numbers, programmes, departments, hostels
- **Verification System**: Driver verification with expiry tracking
- **QR Code Integration**: Automated driver QR generation

### Ride Management
- **Location Routes**: Predefined from/to locations with fare pricing
- **Ride Booking**: Students can book rides with location selection
- **Bill Tracking**: Track ride transactions with status management
- **Statistics**: Revenue tracking, fare analysis, ride counts

### Data Management
- **Automated Backups**: Scheduled JSON exports
- **Email Notifications**: Backup completion alerts
- **Data Export/Import**: CSV/JSON operations for users, locations, and bills
- **Cache Management**: Performance optimization

### Security Features
- **Device Tracking**: Monitor active sessions
- **Secure Authentication**: JWT with bcrypt hashing
- **Input Validation**: Comprehensive data validation
- **File Security**: Type and size restrictions
- **Client Type Validation**: Role restrictions based on client type

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Commit with clear messages: `git commit -m 'Add feature'`
5. Push to your fork: `git push origin feature-name`
6. Create a Pull Request

### Code Standards
- Use TypeScript for all new code
- Follow ESLint configuration
- Add JSDoc comments for public methods
- Test API endpoints with Postman/Insomnia
- Update documentation for new features
- Maintain role-based access control patterns
- Follow mobile app design guidelines

## 📄 License

This project is proprietary software for IIT Delhi transport management.

## 📞 Support

For technical support or questions:
- Check the [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed technical documentation
- Review server logs for error details
- Test API endpoints using the provided examples
- Check mobile app logs via Expo DevTools

---

**Built with ❤️ for IIT Delhi Transport Management**
