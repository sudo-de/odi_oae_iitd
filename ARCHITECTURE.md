# IITD Project Architecture

## 📐 System Architecture Overview

```
┌───────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                          │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│     ┌──────────────┐  ┌──────────────┐  ┌───────────────┐     │
│     │   React Web  │  │ React Native │  │ React Native  │     │
│     │   (Vite)     │  │    iOS App   │  │  Android App  │     │
│     └──────┬───────┘  └───────┬──────┘  └────────┬──────┘     │
│            │                  │                  │            │
│            └──────────────────┼──────────────────┘            │
│                               │                               │
│                          HTTP/REST API                        │
└───────────────────────────────┼───────────────────────────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────────┐
│                      NETWORK LAYER                            │
├───────────────────────────────────────────────────────────────┤
│ • API Gateway / Reverse Proxy (NGINX / Cloudflare / Kong)     │
│ • SSL/TLS Termination                                         │
│ • Load Balancing & Rate Limiting                              │
│ • Request Routing & Health Checks                             │
└────────────────────────────┬──────────────────────────────────┘
                             │
                             ▼
┌───────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                        │
├───────────────────────────────────────────────────────────────┤
│                    NestJS REST API Server                     │
│                    (Modular Architecture)                     │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              Middleware Layer                           │  │
│  │  • CORS                                                 │  │
│  │  • JWT Authentication                                   │  │
│  │  • File Upload (Multer)                                 │  │
│  │  • Request Validation (class-validator)                 │  │
│  │  • Error Handling                                       │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐          │
│  │   Auth       │  │    Users     │  │ App/Business│          │
│  │  Module      │  │   Module     │  │    Module   │          │
│  │              │  │              │  │             │          │
│  │ • Login      │  │ • CRUD       │  │ • Business  │          │
│  │ • JWT        │  │ • File Upload│  │   Logic     │          │
│  │ • Password   │  │ • QR Codes   │  │ • Data Mgmt │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬──────┘          │
│         │                 │                 │                 │
│         └────────┬────────┴────────┬────────┘                 │
│                  │                 │                          │
│         ┌────────▼─────────────────▼────────┐                 │
│         │      Shared Services Layer        │                 │
│         │  • Email Service (SMTP)           │                 │
│         │  • Data Management Service        │                 │
│         │  • Backup & Notification Service  │                 │ 
│         └───────────────────────────────────┘                 │
└────────────────────────────┬──────────────────────────────────┘
                             │
                             ▼
┌───────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER                            │
├───────────────────────────────────────────────────────────────┤
│ • Notification Service (Email/SMS/Push)                       │
│ • Backup Service (Automated & Manual)                         │
│ • File Processing Service (Image/PDF handling)                │
│ • Background Workers (Optional: BullMQ / RabbitMQ / SQS)      │
│ • Scheduled Tasks (Cron jobs for backups, cleanup)            │
└────────────────────────────┬──────────────────────────────────┘
                             │
                             ▼
┌───────────────────────────────────────────────────────────────┐
│                         DATA LAYER                            │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                    MongoDB Database                     │  │
│  │                                                         │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │  │
│  │  │   Users      │  │   Files      │  │   Sessions   │   │  │
│  │  │ Collection   │  │  (GridFS)    │  │  (Optional)  │   │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │  │
│  │                                                         │  │
│  │  • User Documents (with embedded file data)             │  │
│  │  • Indexes: email (unique), _id, role, expiryDate       │  │
│  │  • Transactions & Data Consistency                      │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │         File Storage (Local Filesystem)                 │  │
│  │  • Profile Photos (JPEG/PNG)                            │  │
│  │  • Disability Documents (PDF/Images)                    │  │
│  │  • Backup Files (JSON exports)                          │  │
│  │  • Stored in: server/uploads/ & server/backups/         │  │
│  └─────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌───────────────────────────────────────────────────────────────┐
│              OPTIONAL INFRASTRUCTURE LAYER                    │
├───────────────────────────────────────────────────────────────┤
│ • Redis Cache (Session storage, faster lookups)               │
│ • CDN (Static files, images, assets)                          │
│ • Object Storage (S3/GCS for file storage)                    │
│ • Message Queue (Async processing, notifications)             │
│ • Monitoring (Grafana / Prometheus / CloudWatch)              │
│ • Logging (ELK Stack, CloudWatch, Datadog)                    │
│ • Auto-scaling (Horizontal pod autoscaling)                   │
└───────────────────────────────────────────────────────────────┘
```

## 🏗️ Technology Stack

### Frontend (Client)
- **Web Framework**: React 19
- **Mobile Framework**: React Native (TypeScript/JavaScript)
- **Language**: TypeScript (Web & Mobile)
- **Build Tool**: Vite (Web), React Native CLI/Metro (Mobile)
- **HTTP Client**: Axios (Web & Mobile)
- **State Management**: React Hooks (Web & Mobile), Context API / Redux (Mobile)
- **Styling**: CSS Modules (Web), StyleSheet / Styled Components (Mobile)
- **Code Quality**: ESLint (Web & Mobile), TypeScript (Web & Mobile)

### Backend (Server)
- **Framework**: NestJS 11
- **Language**: TypeScript
- **Runtime**: Node.js
- **HTTP Server**: Express (via @nestjs/platform-express)
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (Passport.js)
- **File Upload**: Multer
- **Validation**: Class Validator
- **Configuration**: @nestjs/config
- **Email Service**: Nodemailer (SMTP)

### Database
- **Primary DB**: MongoDB
- **ODM**: Mongoose
- **Connection**: MongooseModule

### Additional Tools
- **QR Code Generation**:
  - Server: qrcode (Node.js)
  - Mobile: react-native-qrcode-svg (React Native)
- **Email Service**: nodemailer (SMTP with Gmail)
- **Password Hashing**: bcrypt (Server)
- **File Processing**: fs, path (Server)
- **Backup System**: Automatic JSON exports with email notifications
- **Mobile Storage**: @react-native-async-storage/async-storage (React Native)
- **Mobile File Picker**: react-native-image-picker (React Native)

## 📁 Project Structure

```
web_app/                             # Web Application (React + NestJS)
├── client/                          # React Web Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminDashboard/     # Main dashboard component
│   │   │   │   ├── components/      # UI Components
│   │   │   │   │   ├── DashboardOverview.tsx
│   │   │   │   │   ├── UserManagement.tsx
│   │   │   │   │   ├── UserTable.tsx
│   │   │   │   │   ├── DriverDashboard.tsx
│   │   │   │   │   ├── CreateUserModal.tsx
│   │   │   │   │   ├── EditUserModal.tsx
│   │   │   │   │   ├── UserDetailsModal.tsx
│   │   │   │   │   ├── QRCodeModal.tsx
│   │   │   │   │   └── NotificationContainer.tsx
│   │   │   │   ├── hooks/           # Custom React Hooks
│   │   │   │   │   ├── useUserManagement.ts
│   │   │   │   │   ├── useFormManagement.ts
│   │   │   │   │   ├── useModalManagement.ts
│   │   │   │   │   └── useMenuManagement.ts
│   │   │   │   ├── types/           # TypeScript Types
│   │   │   │   │   └── index.ts
│   │   │   │   ├── utils/           # Utility Functions
│   │   │   │   │   └── index.ts
│   │   │   │   ├── styles/          # CSS Styles
│   │   │   │   │   ├── components/
│   │   │   │   │   ├── forms/
│   │   │   │   │   ├── layout/
│   │   │   │   │   ├── modals/
│   │   │   │   │   └── index.css
│   │   │   │   └── index.tsx        # Main Dashboard
│   │   │   ├── Login.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── App.tsx                  # Root Component
│   │   ├── main.tsx                 # Entry Point
│   │   └── styles/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── server/                          # NestJS Backend
│   ├── src/
│   │   ├── auth/                    # Authentication Module
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── dto/                 # Data Transfer Objects
│   │   │   │   ├── login.dto.ts
│   │   │   │   ├── forgot-password.dto.ts
│   │   │   │   └── reset-password.dto.ts
│   │   │   ├── guards/              # Route Guards
│   │   │   │   └── jwt-auth.guard.ts
│   │   │   └── strategies/          # Passport Strategies
│   │   │       └── jwt.strategy.ts
│   │   ├── email/                   # Email Service Module
│   │   │   └── email.module.ts
│   │   ├── data-management/         # Data Management Module
│   │   │   ├── data-management.controller.ts
│   │   │   ├── data-management.service.ts
│   │   │   └── data-management.module.ts
│   │   ├── users/                   # Users Module
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── users.module.ts
│   │   │   └── dto/
│   │   │       ├── create-user.dto.ts
│   │   │       └── update-user.dto.ts
│   │   ├── schemas/                 # MongoDB Schemas
│   │   │   └── user.schema.ts
│   │   ├── app.module.ts            # Root Module
│   │   ├── app.controller.ts
│   │   ├── app.service.ts
│   │   ├── services/                # Shared Services
│   │   │   └── email.service.ts     # Email Service (SMTP)
│   │   └── main.ts                  # Application Entry
│   ├── uploads/                     # File Storage
│   ├── package.json
│   └── tsconfig.json
│
└── package.json                     # Root Package Manager
```

```
mobile/                              # React Native Mobile App (iOS & Android)
├── src/
│   ├── App.tsx                      # App Entry Point
│   ├── index.js                     # Root Entry
│   ├── models/                      # Data Models (TypeScript)
│   │   ├── user.ts
│   │   ├── phone.ts
│   │   ├── hostel.ts
│   │   └── emergencyDetails.ts
│   ├── services/                    # API Services
│   │   ├── apiService.ts            # HTTP Client (Axios)
│   │   ├── authService.ts           # Authentication
│   │   └── userService.ts          # User Management
│   ├── screens/                     # UI Screens
│   │   ├── Login/
│   │   │   └── LoginScreen.tsx
│   │   ├── Dashboard/
│   │   │   └── DashboardScreen.tsx
│   │   ├── Users/
│   │   │   ├── UserListScreen.tsx
│   │   │   ├── UserDetailScreen.tsx
│   │   │   └── CreateUserScreen.tsx
│   │   └── Drivers/
│   │       ├── DriverListScreen.tsx
│   │       └── QRCodeScreen.tsx
│   ├── components/                  # Reusable Components
│   │   ├── UserCard.tsx
│   │   ├── QRCodeViewer.tsx
│   │   └── FilePicker.tsx
│   ├── utils/                       # Utilities
│   │   ├── constants.ts            # API URLs, etc.
│   │   └── storage.ts               # Local storage (AsyncStorage)
│   ├── context/                     # Context API for State Management
│   │   └── AuthContext.tsx
│   └── navigation/                  # Navigation Setup
│       └── AppNavigator.tsx
├── android/                         # Android Configuration
│   └── app/src/main/AndroidManifest.xml
├── ios/                             # iOS Configuration
│   └── Info.plist
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript Configuration
├── metro.config.js                  # Metro Bundler Config
├── babel.config.js                  # Babel Configuration
└── README.md
```

## 🔄 Data Flow Architecture

### Authentication Flow
```
1. User Login Request
   └─> POST /auth/login
       └─> AuthController.login()
           └─> AuthService.validateUser()
               └─> UsersService.findByEmail()
                   └─> MongoDB Query
           └─> bcrypt.compare(password)
           └─> JWT.sign() → Generate Token
       └─> Response: { access_token, user }

2. Authenticated Request
   └─> Request with Header: Authorization: Bearer <token>
       └─> JwtAuthGuard
           └─> JwtStrategy.validate()
               └─> Verify Token
           └─> Attach user to request
       └─> Controller Handler
           └─> Service Method
               └─> MongoDB Operation
```

### User Management Flow
```
1. Create User
   └─> POST /users (multipart/form-data)
       └─> FilesInterceptor (Multer)
           └─> Save files to uploads/
       └─> UsersController.create()
           └─> UsersService.createWithFiles()
               └─> Parse JSON fields (phone, hostel, etc.)
               └─> Hash password (bcrypt)
               └─> Read files → Convert to Buffer
               └─> userModel.create()
                   └─> MongoDB Insert
               └─> Transform Buffer → Base64
           └─> Response: User with base64 file data

2. Get Users
   └─> GET /users
       └─> UsersController.findAll()
           └─> UsersService.findAll()
               └─> Update expiry status
               └─> userModel.find()
                   └─> MongoDB Query
               └─> Transform Buffer → Base64 (for files)
           └─> Response: Array of Users
```

### QR Code Generation Flow
```
1. Generate QR Code
   └─> POST /users/:id/generate-qr
       └─> UsersController.generateQRCode()
           └─> UsersService.generateQRCodeForDriver()
               └─> Find driver in MongoDB
               └─> Create JSON: { driverId, email, name, timestamp }
               └─> QRCode.toDataURL() → Generate QR image
               └─> Update user with QR code (base64 data URL)
           └─> Response: { qrCode: "data:image/png;base64,..." }
```

### Backup System Flow
```
1. Manual Backup
   └─> POST /data-management/backup
       └─> DataManagementController.createBackup()
           └─> DataManagementService.createBackup()
               └─> Query all collections (users, locations, bills)
               └─> Create backup JSON with metadata
               └─> Save to server/backups/ directory
               └─> Send email notifications to admin users
           └─> EmailService.sendBackupNotification()
               └─> Generate HTML email with backup stats
               └─> SMTP send to all admin users

2. Scheduled Backup
   └─> POST /data-management/backup/schedule
       └─> Same flow as manual backup
           └─> Triggered by external scheduler (cron)

3. Backup Email Notifications
   └─> Check backup settings: emailNotifications = true
       └─> Find all users with role = 'admin'
       └─> Send personalized email to each admin
       └─> Email includes: backup stats, file info, timestamp
```

## 🗄️ Database Schema

### User Collection
```typescript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique, indexed),
  password: String (hashed with bcrypt),
  age: Number,
  isActive: Boolean (default: true),
  role: String (default: 'user', enum: ['admin', 'staff', 'student', 'driver']),
  
  // Common Fields
  phone: {
    countryCode: String,
    number: String
  },
  profilePhoto: {
    filename: String,
    mimetype: String,
    size: Number,
    data: Buffer (stored as binary)
  },
  
  // Student Fields
  entryNumber: String,
  programme: String,
  department: String,
  hostel: {
    name: String,
    roomNo: String
  },
  emergencyDetails: {
    name: String,
    address: String,
    phone: String,
    additionalPhone: String
  },
  disabilityType: String,
  udidNumber: String,
  disabilityPercentage: Number,
  disabilityDocument: {
    filename: String,
    mimetype: String,
    size: Number,
    data: Buffer
  },
  expiryDate: Date,
  isExpired: Boolean (default: false),
  
  // Driver Fields
  qrCode: String (base64 data URL),
  
  // Auth Fields
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  
  // Timestamps
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### Indexes
- `email`: Unique index
- `role`: Index for filtering
- `isActive`: Index for filtering
- `expiryDate`: Index for expiry queries

## 🔌 API Architecture

### RESTful API Design

#### Base URL
```
http://localhost:3000
```

#### Authentication Endpoints
```
POST   /auth/login              # Login user
POST   /auth/forgot-password     # Request password reset
POST   /auth/reset-password     # Reset password
GET    /auth/profile            # Get current user (JWT required)
GET    /auth/devices            # Get device information (JWT required)
```

#### User Management Endpoints
```
GET    /users                   # Get all users (JWT required)
GET    /users/:id                # Get user by ID (JWT required)
POST   /users                   # Create user (multipart/form-data, JWT required)
PATCH  /users/:id                # Update user (JWT required)
DELETE /users/:id                # Delete user (JWT required)
PATCH  /users/:id/status         # Toggle user status (JWT required)
PATCH  /users/:id/role           # Update user role (JWT required)
POST   /users/bulk-update        # Bulk update users (JWT required)
GET    /users/stats/overview     # Get user statistics (JWT required)
```

#### QR Code Endpoints
```
POST   /users/:id/generate-qr           # Generate QR for driver (JWT required)
POST   /users/drivers/generate-qr-codes # Generate QR for all drivers (JWT required)
```

#### Data Management Endpoints
```
GET    /data-management/stats           # Get data statistics (JWT required)
POST   /data-management/backup          # Create manual backup (JWT required)
GET    /data-management/backups         # Get backup history (JWT required)
POST   /data-management/backup/settings # Update backup settings (JWT required)
GET    /data-management/backup/settings # Get backup settings (JWT required)
POST   /data-management/export          # Export data (JWT required)
POST   /data-management/import          # Import data (JWT required)
POST   /data-management/cache/clear     # Clear system cache (JWT required)
```

#### Health & Info Endpoints
```
GET    /                    # Hello World
GET    /health              # Health check
GET    /api                 # API information
```

### Request/Response Format

#### Request Headers
```
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

#### File Upload Request
```
Content-Type: multipart/form-data
Authorization: Bearer <jwt_token>

Form Data:
- name: string
- email: string
- role: string
- phone: JSON string
- files: File[] (profilePhoto, disabilityDocument)
```

#### Response Format
```json
{
  "success": true,
  "data": { ... },
  "message": "Success message"
}
```

#### Error Response
```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```

## 🎨 Frontend Architecture

### Component Hierarchy

#### Web (React)
```
App
└─> Login (if not authenticated)
└─> AdminDashboard (if authenticated)
    ├─> Sidebar
    └─> Main Content
        ├─> DashboardOverview
        ├─> UserManagement
        │   └─> UserTable
        ├─> DriverDashboard
        ├─> RideLocationDashboard
        └─> Settings
    └─> Modals
        ├─> CreateUserModal
        ├─> EditUserModal
        ├─> UserDetailsModal
        └─> QRCodeModal
    └─> NotificationContainer
```

#### Mobile (React Native)
```
App
└─> NavigationContainer
    └─> AuthContext.Provider
        ├─> LoginScreen (if not authenticated)
        └─> TabNavigator / DrawerNavigator (if authenticated)
            ├─> DriverDashboardScreen
            │   └─> Stats Cards
            │   └─> Recent Users List
            ├─> UserListScreen
            │   └─> UserCard (FlatList)
            │   └─> SearchBar
            │   └─> FilterChips
            ├─> UserDetailScreen
            │   └─> User Info
            │   └─> QR Code Viewer (if driver)
            │   └─> File Viewers
            ├─> CreateUserScreen
            │   └─> Form Fields
            │   └─> File Picker
            └─> DriverScreen
                └─> Driver List
                └─> QR Code Generator
                └─> QR Code Scanner
```

### State Management
- **Local State**: useState for component-specific state
- **Custom Hooks**: 
  - `useUserManagement`: User CRUD operations
  - `useFormManagement`: Form state and validation
  - `useModalManagement`: Modal visibility and data
  - `useMenuManagement`: Context menu state

### Data Flow (Frontend)

#### Web (React)
```
Component
  └─> Custom Hook (useUserManagement)
      └─> Axios HTTP Request
          └─> API Endpoint
              └─> Response
                  └─> Update State
                      └─> Re-render Component
```

#### Mobile (React Native)
```
Component
  └─> Service (UserService)
      └─> Axios HTTP Request
          └─> API Endpoint
              └─> Response
                  └─> Context/State Update
                      └─> Re-render Component
```

## 🔒 Security Architecture

### Authentication
- **JWT Tokens**: Stateless authentication
- **Token Storage**: localStorage (client-side)
- **Token Expiry**: 1 day
- **Password Hashing**: bcrypt (10 rounds)

### Authorization
- **Route Guards**: JwtAuthGuard on protected routes
- **Role-based Access**: Role field in user document
- **Token Validation**: Passport JWT Strategy

### Data Security
- **Password**: Never returned in API responses
- **File Upload**: 
  - Type validation (JPEG, PNG, PDF)
  - Size limit (5MB)
  - Random filename generation
- **CORS**: Configured for specific origins
- **Input Validation**: DTOs with class-validator

## 📦 Module Architecture (Backend)

### AppModule (Root)
```typescript
@Module({
  imports: [
    ConfigModule,        // Environment configuration
    MongooseModule,      // MongoDB connection
    UsersModule,         // User management
    AuthModule,          // Authentication
    EmailModule,         // Email service
    DataManagementModule // Backup & data management
  ]
})
```

### AuthModule
```typescript
@Module({
  imports: [
    UsersModule,         // User lookup
    PassportModule,      // Authentication
    JwtModule,           // JWT handling
    MongooseModule       // User schema
  ],
  providers: [
    AuthService,         // Auth business logic
    JwtStrategy          // JWT validation
  ]
})
```

### UsersModule
```typescript
@Module({
  imports: [
    MongooseModule       // User schema
  ],
  providers: [
    UsersService         // User business logic
  ],
  exports: [
    UsersService         // Export for AuthModule
  ]
})
```

### EmailModule
```typescript
@Module({
  providers: [
    EmailService         // SMTP email service
  ],
  exports: [
    EmailService         // Export for other modules
  ]
})
```

### DataManagementModule
```typescript
@Module({
  imports: [
    MongooseModule,      // Database access
    EmailModule          // Email notifications
  ],
  controllers: [
    DataManagementController // Backup & data endpoints
  ],
  providers: [
    DataManagementService // Backup business logic
  ]
})
```

## 🚀 Deployment Architecture

### Development Environment
```
┌─────────────────────────────────────────────────────────────┐
│                    LOCAL DEVELOPMENT                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐  │
│  │   React     │      │   NestJS    │      │   MongoDB   │  │
│  │  (Vite)     │◄────►│  Server/API │◄────►│  Database   │  │
│  │  :5173      │      │   :3000     │      │  :27017     │  │
│  │  (HMR)      │      │  (Hot Reload)│     │  (Local)    │  │
│  └─────────────┘      └─────────────┘      └─────────────┘  │
│         ▲                      ▲                            │
│         │                      │                            │
│  ┌──────┴───────┐      ┌───────┴───────┐                   │
│  │              │      │               │                   │
│  │ React Native │      │ React Native  │                   │
│  │   iOS App    │      │  Android App  │                   │
│  │ (Simulator)  │      │  (Emulator)   │                   │
│  └──────────────┘      └───────────────┘                   │
│                                                             │
│  Features:                                                  │
│  • Hot Module Replacement (HMR)                            │
│  • Source Maps                                              │
│  • Debug Mode Enabled                                       │
│  • Local MongoDB Instance                                   │
└─────────────────────────────────────────────────────────────┘
```

### Staging Environment
```
┌─────────────────────────────────────────────────────────────┐
│                    STAGING / PRE-PRODUCTION                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│         ┌─────────────────────────────────────┐             │
│         │      CI/CD Pipeline (GitHub)       │             │
│         │  • Build & Test                     │             │
│         │  • Docker Image Build              │             │
│         │  • Push to Container Registry      │             │
│         └──────────────┬──────────────────────┘             │
│                        │                                    │
│                        ▼                                    │
│         ┌─────────────────────────────────────┐             │
│         │   Container Orchestration           │             │
│         │   (Docker Compose / Kubernetes)     │             │
│         └──────────────┬──────────────────────┘             │
│                        │                                    │
│        ┌───────────────┼───────────────┐                   │
│        │               │               │                   │
│        ▼               ▼               ▼                   │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐              │
│  │  React   │   │  NestJS  │   │ MongoDB  │              │
│  │  (Static)│   │  Server  │   │ (Atlas/  │              │
│  │  Build   │   │ (Docker) │   │  Docker) │              │
│  │          │   │          │   │          │              │
│  │  :80     │   │  :3000   │   │  :27017  │              │
│  └──────────┘   └──────────┘   └──────────┘              │
│                                                             │
│  Features:                                                  │
│  • Production-like environment                              │
│  • Automated deployments                                   │
│  • Integration testing                                      │
│  • Performance monitoring                                   │
└─────────────────────────────────────────────────────────────┘
```

### Production - Containerized Deployment (Docker)
```
┌─────────────────────────────────────────────────────────────┐
│              PRODUCTION - CONTAINERIZED                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    ┌───────────────┐                        │
│                    │  Load Balancer│                        │
│                    │  (NGINX/HAProxy)                       │
│                    │  SSL Termination                       │
│                    └───────┬───────┘                        │
│                            │                                │
│        ┌───────────────────┼───────────────────┐           │
│        │                   │                   │           │
│        ▼                   ▼                   ▼           │
│  ┌──────────┐      ┌──────────┐      ┌──────────┐        │
│  │  React   │      │  NestJS  │      │ MongoDB  │        │
│  │  (Static)│      │  Server  │      │  Atlas/  │        │
│  │  Build   │      │ (Docker) │      │  Managed │        │
│  │          │      │          │      │          │        │
│  │  :80/:443│      │  :3000   │      │  :27017  │        │
│  │  (CDN)   │      │ (PM2/    │      │  (Replica│        │
│  │          │      │  Cluster)│      │   Set)   │        │
│  └──────────┘      └──────────┘      └──────────┘        │
│        │                 │                  │             │
│        └─────────────────┼──────────────────┘             │
│                          │                                 │
│        ┌─────────────────┴─────────────────┐              │
│        │                                     │              │
│        ▼                                     ▼              │
│  ┌──────────┐                        ┌──────────┐         │
│  │  Redis   │                        │  File    │         │
│  │  Cache   │                        │ Storage  │         │
│  │          │                        │ (S3/GCS) │         │
│  │  :6379   │                        │          │         │
│  └──────────┘                        └──────────┘         │
│                                                             │
│  Mobile Apps:                                               │
│  ┌──────────────┐              ┌──────────────┐           │
│  │ App Store    │              │ Play Store   │           │
│  │ (iOS)        │              │ (Android)    │           │
│  └──────┬───────┘              └──────┬───────┘           │
│         │                              │                   │
│         └──────────┬───────────────────┘                   │
│                   │                                        │
│                   ▼                                        │
│         ┌─────────────────────┐                           │
│         │  React Native Apps   │                           │
│         │  (Native Builds)     │                           │
│         └─────────────────────┘                           │
│                                                             │
│  Features:                                                  │
│  • High Availability (Multiple instances)                  │
│  • Auto-scaling                                            │
│  • Health Checks & Auto-restart                            │
│  • Monitoring & Logging                                    │
│  • Backup & Disaster Recovery                              │
└─────────────────────────────────────────────────────────────┘
```

### Production - Kubernetes Deployment (Recommended)
```
┌─────────────────────────────────────────────────────────────┐
│           PRODUCTION - KUBERNETES (EKS/GKE/AKS)             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    ┌─────────────────┐                      │
│                    │  Ingress        │                      │
│                    │  (NGINX/ALB)    │                      │
│                    │  SSL/TLS        │                      │
│                    └────────┬─────────┘                     │
│                             │                               │
│        ┌────────────────────┼────────────────────┐          │
│        │                    │                    │          │
│        ▼                    ▼                    ▼          │
│  ┌──────────┐      ┌──────────┐      ┌──────────┐           │
│  │  React   │      │  NestJS  │      │ MongoDB  │           │
│  │  Service │      │  Service │      │  Service │           │
│  │          │      │          │      │          │           │
│  │  (CDN)   │      │  (Pods)  │      │  (Stateful│          │
│  │          │      │          │      │   Set)    │          │
│  └──────────┘      └──────────┘      └──────────┘           │
│        │                 │                  │               │
│        │                 │                  │               │
│  ┌─────▼─────┐    ┌───────▼──────┐    ┌──────▼─────┐        │
│  │ Deployment│    │  Deployment  │    │ StatefulSet│        │
│  │ (Replicas)│    │  (Replicas)  │    │ (Replicas) │        │
│  │    :80    │    │    :3000     │    │   :27017   │        │
│  └───────────┘    └──────────────┘    └────────────┘        │
│        │                 │                  │               │
│        └─────────────────┼──────────────────┘               │
│                          │                                  │
│        ┌─────────────────┴─────────────────┐                │
│        │                                     │              │
│        ▼                                     ▼              │
│  ┌──────────┐                        ┌──────────┐           │
│  │  Redis   │                        │  PVC     │           │
│  │  (Cache) │                        │  (Files) │           │
│  │          │                        │          │           │
│  │ Stateful │                        │  S3/GCS  │           │
│  │   Set    │                        │  (CSI)   │           │
│  └──────────┘                        └──────────┘           │
│                                                             │
│  Kubernetes Components:                                     │
│  • Horizontal Pod Autoscaler (HPA)                          │
│  • ConfigMaps & Secrets                                     │
│  • Service Mesh (Optional: Istio/Linkerd)                   │
│  • ArgoCD (GitOps)                                          │
│  • Prometheus & Grafana (Monitoring)                        │
│                                                             │
│  Mobile Apps Distribution:                                  │
│  ┌──────────────┐              ┌──────────────┐             │
│  │ App Store    │              │ Play Store   │             │
│  │ (iOS)        │              │ (Android)    │             │
│  │              │              │              │             │
│  │ TestFlight    │              │ Internal     │            │
│  │ (Beta)       │              │ Testing      │             │
│  └──────┬───────┘              └──────┬───────┘             │
│         │                              │                    │
│         └──────────┬───────────────────┘                    │
│                   │                                         │
│                   ▼                                         │
│         ┌─────────────────────┐                             │
│         │  React Native Apps  │                             │
│         │  (CI/CD Build)      │                             │
│         └─────────────────────┘                             │
│                                                             │
│  Features:                                                  │
│  • Auto-scaling (CPU/Memory based)                          │
│  • Rolling Updates & Rollbacks                              │
│  • Service Discovery & Load Balancing                       │
│  • Self-healing (Auto-restart failed pods)                  │
│  • Resource Limits & Requests                               │
│  • Network Policies (Security)                              │
│  • Persistent Storage                                       │
└─────────────────────────────────────────────────────────────┘
```

### CI/CD Pipeline Flow
```
┌─────────────────────────────────────────────────────────────┐
│                    CI/CD PIPELINE                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Developer                                                  │
│     │                                                       │
│     ▼                                                       │
│  ┌──────────────┐                                           │
│  │ Git Push     │                                           │
│  │ (GitHub)     │                                           │
│  └──────┬───────┘                                           │
│         │                                                   │
│         ▼                                                   │
│  ┌─────────────────────────────────────┐                    │
│  │  GitHub Actions                     │                    │
│  │  ┌───────────────────────────────┐  │                    │
│  │  │ 1. Lint & Test                │  │                    │
│  │  │ 2. Build Docker Images        │  │                    │
│  │  │ 3. Security Scan              │  │                    │
│  │  │ 4. Push to Registry (GHCR)    │  │                    │
│  │  └───────────────┬───────────────┘  │                    │
│  └──────────────────┼──────────────────┘                    │
│                     │                                       │
│         ┌───────────┴─────────┐                             │
│         │                     │                             │
│         ▼                     ▼                             │
│  ┌──────────┐          ┌──────────┐                         │
│  │  Client  │          │  Server  │                         │
│  │  Build   │          │  Build   │                         │
│  └────┬─────┘          └────┬─────┘                         │
│       │                     │                               │
│       └──────────┬──────────┘                               │
│                  │                                          │
│                  ▼                                          │
│         ┌─────────────────┐                                 │
│         │ Container       │                                 │
│         │ Registry (GHCR) │                                 │
│         └────────┬────────┘                                 │
│                  │                                          │
│         ┌────────┴────────┐                                 │
│         │                 │                                 │
│         ▼                 ▼                                 │
│  ┌──────────┐      ┌──────────┐                             │
│  │  Staging │      │Production│                             │
│  │  Deploy  │      │  Deploy   │                            │
│  │          │      │           │                            │
│  │ (Auto)   │      │ (Manual/  │                            │
│  │          │      │  Approval)│                            │
│  └──────────┘      └───────────┘                            │
│                                                             │
│  Deployment Methods:                                        │
│  • Kubernetes: kubectl apply / ArgoCD sync                  │
│  • Docker: docker-compose up / docker stack deploy          │
│  • Cloud: AWS ECS / GCP Cloud Run / Azure Container Apps    │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Request Lifecycle

### Complete Request Flow
```
1. Client Request
   └─> HTTP Request (with/without JWT)

2. NestJS Middleware
   └─> CORS Check
   └─> JWT Guard (if protected route)
       └─> Extract token from header
       └─> Validate token
       └─> Attach user to request

3. Controller
   └─> Route handler
   └─> Validate DTO (if POST/PATCH)
   └─> File upload handling (if multipart)

4. Service
   └─> Business logic
   └─> Data transformation
   └─> Database operations

5. Database
   └─> MongoDB query/update
   └─> Return document(s)

6. Service Response
   └─> Transform data (Buffer → Base64)
   └─> Return to controller

7. Controller Response
   └─> Serialize to JSON
   └─> HTTP Response

8. Client
   └─> Receive response
   └─> Update UI state
```

## 📊 Data Transformation

### Server → Client
```
MongoDB Document
  └─> Mongoose Model
      └─> Service Layer
          └─> Transform Buffer → Base64
              └─> JSON Response
                  └─> Client receives base64 strings
```

### Client → Server
```
Form Data
  └─> JSON fields + Files
      └─> Multipart FormData
          └─> Server receives
              └─> Parse JSON strings
                  └─> Save files to disk
                      └─> Read files → Buffer
                          └─> Store in MongoDB
```

## 🎯 Key Design Patterns

### Backend
- **Module Pattern**: NestJS modules for separation of concerns
- **Dependency Injection**: NestJS DI container
- **Repository Pattern**: Mongoose models as repositories
- **DTO Pattern**: Data Transfer Objects for validation
- **Guard Pattern**: Route protection with guards
- **Strategy Pattern**: Passport strategies for auth

### Frontend (Web)
- **Component Pattern**: Reusable React components
- **Custom Hooks**: Business logic separation
- **Container/Presenter**: Smart/dumb components
- **Observer Pattern**: React state updates

### Frontend (Mobile)
- **Component Pattern**: Reusable React Native components
- **Service Pattern**: API service layer
- **Context Pattern**: State management (Context API/Redux)
- **Repository Pattern**: Data access abstraction
- **Custom Hooks Pattern**: Reusable logic hooks

## 🔧 Configuration

### Environment Variables
```bash
# Server (.env)
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/iitd-db
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=1d

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=IITD System <your-email@gmail.com>
```

### CORS Configuration
- **Development**: Allow all origins (for React Native mobile apps)
- **Production**: Restrict to specific domains
- **Mobile Apps**: No CORS restrictions (native apps)

### Mobile Configuration
- **Android**: Enable cleartext traffic for development
- **iOS**: Configure App Transport Security
- **Base URL**: Use server IP address (not localhost) for mobile

## 📈 Scalability Considerations

### Current Architecture
- Monolithic NestJS application
- Single MongoDB instance
- File storage on local filesystem

### Future Enhancements
- **Microservices**: Split into auth, users, files services
- **File Storage**: Move to S3/Cloud Storage
- **Caching**: Redis for session/token caching
- **Load Balancing**: Multiple NestJS instances
- **Database**: MongoDB replica set for high availability
- **CDN**: Serve static assets and images
- **Push Notifications**: Firebase Cloud Messaging for mobile
- **Offline Support**: Local database (SQLite/Hive) for mobile
- **Biometric Auth**: Face ID / Fingerprint for mobile apps

## 🔍 Monitoring & Logging

### Current
- Console logging
- Error handling in services

### Recommended
- **Winston** or **Pino** for structured logging
- **Sentry** for error tracking
- **Prometheus** for metrics
- **Health checks** endpoint

## 📝 API Documentation

### Current
- Code comments
- README files

### Recommended
- **Swagger/OpenAPI** integration
- Auto-generated API docs
- Postman collection

---

## 🎓 Architecture Principles

1. **Separation of Concerns**: Clear boundaries between layers
2. **Single Responsibility**: Each module/component has one purpose
3. **DRY (Don't Repeat Yourself)**: Reusable components and services
4. **Type Safety**: TypeScript throughout
5. **Security First**: Authentication and validation at every layer
6. **Scalability**: Architecture supports growth
7. **Maintainability**: Clear structure and documentation

