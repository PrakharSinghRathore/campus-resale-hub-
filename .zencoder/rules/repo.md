---
description: Repository Information Overview
alwaysApply: true
---

# Campus Resale Hub Information

## Summary
A full-stack marketplace application for campus trading with real-time messaging, built with React, Node.js, MongoDB, and Firebase Authentication. The application enables university students to buy and sell items within their campus community with features like real-time chat, product listings, and advanced search capabilities.

## Structure
- **frontend/**: React application built with Vite, TypeScript, and Radix UI components
- **backend/**: Node.js Express API with TypeScript, MongoDB, and Socket.IO
- **package.json**: Root workspace configuration for managing both projects

## Language & Runtime
**Languages**: TypeScript, JavaScript
**Node Version**: >=18.0.0
**Package Manager**: npm (>=8.0.0)
**Build System**: Vite (frontend), TypeScript compiler (backend)

## Projects

### Frontend
**Configuration File**: frontend/package.json, frontend/vite.config.ts

#### Language & Runtime
**Language**: TypeScript
**Framework**: React 18
**Build System**: Vite 6.3.5

#### Dependencies
**Main Dependencies**:
- React 18.3.1
- Firebase 12.3.0
- Socket.io-client 4.8.1
- Radix UI component library
- Axios 1.12.2
- Three.js/React Three Fiber (3D rendering)

#### Build & Installation
```bash
cd frontend
npm install
npm run dev    # Development server on port 3000
npm run build  # Production build to build/ directory
```

### Backend
**Configuration File**: backend/package.json, backend/tsconfig.json

#### Language & Runtime
**Language**: TypeScript
**Framework**: Express 4.19.2
**Database**: MongoDB (mongoose 8.3.2)

#### Dependencies
**Main Dependencies**:
- Express 4.19.2
- Socket.io 4.7.5
- Mongoose 8.3.2
- Firebase Admin 12.1.0
- Cloudinary 2.7.0 (image uploads)
- Zod 3.23.8 (validation)

**Development Dependencies**:
- TypeScript 5.4.5
- ts-node-dev 2.0.0

#### Build & Installation
```bash
cd backend
npm install
npm run dev    # Development server with hot reload
npm run build  # Compile TypeScript to JavaScript
npm start      # Run compiled JavaScript
```

## Environment Configuration
**Frontend**: .env file with Firebase config and API URLs
**Backend**: .env file with MongoDB URI, Firebase credentials, and service configs

## API Endpoints
- **Auth**: /api/auth/verify, /api/auth/me
- **Users**: /api/users/profile, /api/users/:id
- **Listings**: /api/listings, /api/listings/:id
- **Chats**: /api/chats, /api/chats/:id/messages
- **Admin**: /api/admin/users, /api/admin/listings, /api/admin/stats

## Real-time Features
**WebSocket Server**: Socket.IO implementation for:
- Real-time messaging
- Typing indicators
- Online status updates
- Notifications