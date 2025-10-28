# IITD Full-Stack Project

This project contains a React frontend client and a NestJS backend server.

## Project Structure

```
├── client/          # React frontend (Vite + TypeScript)
├── server/          # NestJS backend (TypeScript)
└── package.json     # Root package.json for managing both projects
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm

### Installation

Install dependencies for all projects:

```bash
npm run install:all
```

### Development

Run both client and server in development mode:

```bash
npm run dev
```

This will start:
- React client on http://localhost:5173
- NestJS server on http://localhost:3000

### Running Individual Services

#### Client Only
```bash
npm run dev:client
```

#### Server Only
```bash
npm run dev:server
```

### Production

Build and start the application:

```bash
npm run build
npm start
```

## Available Scripts

- `npm run dev` - Start both client and server in development mode
- `npm run dev:client` - Start only the React client
- `npm run dev:server` - Start only the NestJS server
- `npm run build` - Build both client and server
- `npm run build:client` - Build only the React client
- `npm run build:server` - Build only the NestJS server
- `npm run start` - Start the server in production mode
- `npm run install:all` - Install dependencies for all projects

## API Endpoints

The NestJS server provides the following endpoints:

- `GET /` - Returns "Hello World!"
- `GET /health` - Returns health status

## Technologies Used

### Frontend (Client)
- React 19
- TypeScript
- Vite
- ESLint

### Backend (Server)
- NestJS
- TypeScript
- Express (via @nestjs/platform-express)
