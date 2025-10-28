# NestJS Server with MongoDB

This is a NestJS backend server with MongoDB integration using Mongoose.

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm
- MongoDB (running locally or MongoDB Atlas)

### Installation

```bash
npm install
```

### Environment Setup

Create a `.env` file in the server directory:

```bash
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/iitd-db
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=1d
```

### Running the app

```bash
# development
npm run dev

# production mode
npm run start:prod
```

### Available Scripts

- `npm run build` - Build the application
- `npm run dev` - Start the application in development mode with hot reload
- `npm run start` - Start the application
- `npm run start:debug` - Start the application in debug mode
- `npm run start:prod` - Start the application in production mode
- `npm run lint` - Run ESLint
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests

## API Endpoints

### General
- `GET /` - Returns "Hello World!"
- `GET /health` - Returns health status with MongoDB info
- `GET /api` - Returns API information

### Users
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create a new user
- `PATCH /users/:id` - Update user by ID
- `DELETE /users/:id` - Delete user by ID

## Database Schema

### User Schema
```typescript
{
  name: string (required)
  email: string (required, unique)
  age?: number (optional)
  isActive: boolean (default: true)
  createdAt: Date (auto-generated)
  updatedAt: Date (auto-generated)
}
```

## MongoDB Connection

The application connects to MongoDB using the URI specified in the `MONGODB_URI` environment variable. Default connection: `mongodb://localhost:27017/iitd-db`

## CORS Configuration

CORS is enabled for the React frontend running on `http://localhost:5173`.

## Port

The server runs on port 3000 by default (configurable via PORT environment variable).
