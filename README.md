# IITD Transport Management System

A comprehensive full-stack application for managing IIT Delhi transport operations, built with React, NestJS, and MongoDB.

## 🚀 Features

### 👥 User Management
- **Multi-role System**: Admin, Driver, and User roles
- **Bulk Operations**: Import/export users, bulk status updates
- **Profile Management**: User profiles with photos and disability documents
- **QR Code Generation**: Automated QR codes for drivers

### 🔐 Security & Authentication
- **JWT Authentication**: Secure token-based authentication
- **Device Tracking**: Monitor active device sessions
- **Password Security**: bcrypt hashing with validation
- **Role-based Access**: Granular permissions system

### 💾 Data Management
- **Automatic Backups**: Scheduled JSON exports with email notifications
- **Data Export/Import**: Bulk data operations
- **Cache Management**: System performance optimization
- **Statistics Dashboard**: Real-time data insights

### 📧 Email Notifications
- **SMTP Integration**: Gmail SMTP with app password support
- **Backup Alerts**: Automated email notifications for completed backups
- **Admin Communications**: Targeted notifications to administrators

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
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  File Storage   │    │  Email Service  │    │   User Data     │
│  (Local/Cloud)  │    │   (SMTP)        │    │   Collections   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 Project Structure

```
├── client/                      # React Web Frontend
│   ├── src/
│   │   ├── components/
│   │   │   └── AdminDashboard/  # Main dashboard interface
│   │   │       ├── components/   # UI components
│   │   │       │   ├── Settings.tsx     # System settings
│   │   │       │   ├── UserManagement.tsx # User CRUD
│   │   │       │   └── ...
│   │   │       └── styles/       # CSS styles
│   │   └── main.tsx
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
│   │   ├── data-management/     # Backup & data management
│   │   │   ├── data-management.controller.ts
│   │   │   └── data-management.service.ts
│   │   ├── email/               # Email service module
│   │   │   └── email.module.ts
│   │   ├── services/            # Shared services
│   │   │   └── email.service.ts
│   │   └── schemas/             # MongoDB schemas
│   │       └── user.schema.ts
│   ├── uploads/                 # File storage
│   └── package.json
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

### Database Setup

1. **Install MongoDB** (if not already installed):
   ```bash
   # macOS with Homebrew
   brew install mongodb-community
   brew services start mongodb-community

   # Ubuntu/Debian
   sudo apt-get install mongodb

   # Windows
   # Download and install from mongodb.com
   ```

2. **Start MongoDB**:
   ```bash
   mongod  # Default port 27017
   ```

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
```

### Development

Run both client and server in development mode:

```bash
npm run dev
```

This will start:
- **React Client**: http://localhost:5173
- **NestJS Server**: http://localhost:3000
- **MongoDB**: localhost:27017

### Running Individual Services

#### Client Only
```bash
npm run dev:client
# Or: cd client && npm run dev
```

#### Server Only
```bash
npm run dev:server
# Or: cd server && npm run dev
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

### First-Time Setup

1. **Start the application** in development mode
2. **Access the web interface** at http://localhost:5173
3. **Create an admin user** through the registration process
4. **Configure backup settings** in the Settings page
5. **Test email notifications** by creating a backup

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

## 🔌 API Endpoints

### Authentication
```
POST   /auth/login              # User login
POST   /auth/forgot-password     # Request password reset
POST   /auth/reset-password     # Reset password with token
GET    /auth/profile            # Get current user profile (JWT)
GET    /auth/devices            # Get device information (JWT)
```

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

### Frontend (React Web)
- **Framework**: React 19 with Hooks
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: CSS Modules with custom design system
- **HTTP Client**: Fetch API (native)
- **State Management**: React useState/useEffect
- **Code Quality**: ESLint
- **UI Components**: Custom component library

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

### Dashboard Overview
- **Real-time Statistics**: User counts, active sessions
- **System Health**: Database status, server uptime
- **Quick Actions**: Create users, generate reports

### User Management
- **Role-based Access**: Admin, Driver, User permissions
- **Bulk Operations**: Import/export, mass updates
- **Profile Management**: Photos, documents, metadata
- **QR Code Integration**: Automated driver QR generation

### Data Management
- **Automated Backups**: Scheduled JSON exports
- **Email Notifications**: Backup completion alerts
- **Data Export/Import**: CSV/JSON operations
- **Cache Management**: Performance optimization

### Security Features
- **Device Tracking**: Monitor active sessions
- **Secure Authentication**: JWT with bcrypt hashing
- **Input Validation**: Comprehensive data validation
- **File Security**: Type and size restrictions

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

## 📄 License

This project is proprietary software for IIT Delhi transport management.

## 📞 Support

For technical support or questions:
- Check the [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed technical documentation
- Review server logs for error details
- Test API endpoints using the provided examples
