# IITD Project Architecture

## 📐 System Architecture Overview

```
┌───────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                          │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐        │
│  │   React Web  │  │ Flutter iOS  │  │Flutter Android│        │
│  │   (Vite)     │  │     App      │  │     App       │        │
│  └──────┬───────┘  └───────┬──────┘  └────────┬──────┘        │
│         │                  │                  │               │
│         └──────────────────┼──────────────────┘               │
│                            │                                  │
│                    HTTP/REST API                              │
└────────────────────────────┼──────────────────────────────────┘
                             │
                             ▼
┌───────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                        │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              NestJS REST API Server                     │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │  │
│  │  │   Auth       │  │    Users     │  │      App     │   │  │
│  │  │  Module      │  │   Module     │  │    Module    │   │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │  │
│  │                                                         │  │
│  │  ┌──────────────────────────────────────────────────┐   │  │
│  │  │         Middleware Layer                         │   │  │
│  │  │  • CORS                                          │   │  │
│  │  │  • JWT Authentication                            │   │  │
│  │  │  • File Upload (Multer)                          │   │  │
│  │  │  • Request Validation                            │   │  │
│  │  └──────────────────────────────────────────────────┘   │  │
│  └─────────────────────────────────────────────────────────┘  │
└────────────────────────────┬──────────────────────────────────┘
                             │
                             ▼
┌───────────────────────────────────────────────────────────────┐
│                      DATA LAYER                               │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              MongoDB Database                           │  │
│  │                                                         │  │
│  │  ┌──────────────┐  ┌─────────****─────┐  ┌──────────────┐   │  │
│  │  │   Users      │  │   Files      │  │   Sessions   │   │  │
│  │  │ Collection   │  │  (GridFS)    │  │  (Optional)  │   │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │  │
│  │                                                         │  │
│  │  • User Documents (with embedded file data)             │  │
│  │  • Indexes on email, _id, role                          │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │         File Storage (Local)                            │  │
│  │  • Profile Photos (JPEG/PNG)                            │  │
│  │  • Disability Documents (PDF/Images)                    │  │
│  │  • Stored in: server/uploads/                           │  │
│  └─────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

## 🏗️ Technology Stack

### Frontend (Client)
- **Web Framework**: React 19
- **Mobile Framework**: Flutter (Dart)
- **Language**: TypeScript (Web), Dart (Mobile)
- **Build Tool**: Vite (Web), Flutter CLI (Mobile)
- **HTTP Client**: Axios (Web), Dio (Mobile)
- **State Management**: React Hooks (Web), Provider/Riverpod (Mobile)
- **Styling**: CSS Modules (Web), Material Design/Cupertino (Mobile)
- **Code Quality**: ESLint (Web), Dart Analyzer (Mobile)

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

### Database
- **Primary DB**: MongoDB
- **ODM**: Mongoose
- **Connection**: MongooseModule

### Additional Tools
- **QR Code Generation**: 
  - Server: qrcode (Node.js)
  - Mobile: qr_flutter (Flutter)
- **Password Hashing**: bcrypt (Server)
- **File Processing**: fs, path (Server)
- **Mobile Storage**: shared_preferences (Flutter)
- **Mobile File Picker**: image_picker (Flutter)

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
│   │   └── main.ts                  # Application Entry
│   ├── uploads/                     # File Storage
│   ├── package.json
│   └── tsconfig.json
│
└── package.json                     # Root Package Manager
```

```
mobile/                              # Flutter Mobile App (iOS & Android)
├── lib/
│   ├── main.dart                    # App Entry Point
│   ├── app.dart                     # Root Widget
│   ├── models/                      # Data Models
│   │   ├── user.dart
│   │   ├── phone.dart
│   │   ├── hostel.dart
│   │   └── emergency_details.dart
│   ├── services/                    # API Services
│   │   ├── api_service.dart         # HTTP Client (Dio)
│   │   ├── auth_service.dart        # Authentication
│   │   └── user_service.dart        # User Management
│   ├── screens/                     # UI Screens
│   │   ├── login/
│   │   │   └── login_screen.dart
│   │   ├── dashboard/
│   │   │   └── dashboard_screen.dart
│   │   ├── users/
│   │   │   ├── user_list_screen.dart
│   │   │   ├── user_detail_screen.dart
│   │   │   └── create_user_screen.dart
│   │   └── drivers/
│   │       ├── driver_list_screen.dart
│   │       └── qr_code_screen.dart
│   ├── widgets/                     # Reusable Widgets
│   │   ├── user_card.dart
│   │   ├── qr_code_viewer.dart
│   │   └── file_picker.dart
│   ├── utils/                       # Utilities
│   │   ├── constants.dart           # API URLs, etc.
│   │   └── storage.dart             # Local storage
│   └── providers/                   # State Management (if using Provider/Riverpod)
│       └── user_provider.dart
├── android/                         # Android Configuration
│   └── app/src/main/AndroidManifest.xml
├── ios/                             # iOS Configuration
│   └── Runner/Info.plist
├── pubspec.yaml                     # Dependencies
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

#### Mobile (Flutter)
```
App
└─> MaterialApp / CupertinoApp
    └─> AuthWrapper
        ├─> LoginScreen (if not authenticated)
        └─> MainScreen (if authenticated)
            └─> BottomNavigationBar / Drawer
                ├─> DriverDashboardScreen
                │   └─> Stats Cards
                │   └─> Recent Users List
                ├─> UserListScreen
                │   └─> UserCard (List)
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

#### Mobile (Flutter)
```
Widget
  └─> Service (UserService)
      └─> Dio HTTP Request
          └─> API Endpoint
              └─> Response
                  └─> Provider/State Update
                      └─> Rebuild Widget
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
    AuthModule          // Authentication
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

## 🚀 Deployment Architecture

### Development
```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   React     │      │   NestJS    │      │   MongoDB   │
│  (Vite)     │◄────►│   Server    │◄────►│  Database   │
│  :5173      │      │   :3000     │      │  :27017     │
└─────────────┘      └─────────────┘      └─────────────┘
      ▲                      ▲
      │                      │
      │              ┌───────┴───────┐
      │              │               │
┌─────────────┐ ┌──────────┐  ┌───────────┐
│  Flutter    │ │ Flutter  │  │  Flutter  │
│   iOS App   │ │ Android  │  │  Web App  │
│  (Simulator)│ │(Emulator)│  │  (Browser)│
└─────────────┘ └──────────┘  └───────────┘
```

### Production (Recommended)
```
                    ┌─────────────┐      ┌─────────────┐
                    │   NestJS    │      │   MongoDB   │
                    │   Server    │◄────►│  (Atlas or  │
                    │   (PM2)     │      │ Self-hosted)│
                    │   :3000     │      │             │
                    └──────┬──────┘      └─────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Nginx     │    │  App Store  │    │ Play Store  │
│  (Reverse   │    │   (iOS)     │    │  (Android)  │
│   Proxy)    │    │             │    │             │
│  :80/:443   │    └──────┬──────┘    └──────┬──────┘
└──────┬──────┘           │                  │
       │                  │                  │
       ▼                  ▼                  ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   React     │    │  Flutter    │    │  Flutter    │
│  (Static)   │    │  iOS App    │    │ Android App │ 
│   Build     │    │  (Native)   │    │  (Native)   │
│  (CDN)      │    └─────────────┘    └─────────────┘
└─────────────┘
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
- **Widget Pattern**: Reusable Flutter widgets
- **Service Pattern**: API service layer
- **Provider Pattern**: State management (Provider/Riverpod)
- **Repository Pattern**: Data access abstraction
- **BLoC Pattern**: Business Logic Component (optional)

## 🔧 Configuration

### Environment Variables
```bash
# Server (.env)
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/iitd-db
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=1d
```

### CORS Configuration
- **Development**: Allow all origins (for Flutter mobile apps)
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

