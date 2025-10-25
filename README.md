# Campus Resale Hub

A full-stack marketplace application for campus trading with real-time messaging, built with React, Node.js, MongoDB, and Firebase Authentication.

## 🚀 Features

- **User Authentication**: Firebase Auth with university email validation
- **Real-time Messaging**: Socket.IO powered chat system
- **Product Listings**: Create, browse, and manage campus items
- **Advanced Search**: Filter by category, condition, hostel block
- **Responsive Design**: Works on desktop and mobile
- **Admin Panel**: User and listing management
- **Secure Backend**: JWT token verification and CORS protection

## 🏗️ Architecture

```
campus-resale-hub/
├── frontend/          # React + Vite + TypeScript
├── backend/           # Node.js + Express + TypeScript
├── package.json       # Root workspace configuration
└── README.md
```

## 📋 Prerequisites

- Node.js 18+ and npm 8+
- MongoDB Atlas account or local MongoDB
- Firebase project with Authentication enabled

## ⚡ Quick Start

### 1. Clone and Install Dependencies

```bash
npm run install:all
```

### 2. Environment Setup

#### Firebase Setup
1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication > Email/Password provider
3. Get your web app config from Project Settings
4. Generate a service account key for the backend

#### MongoDB Setup
1. Create a MongoDB Atlas cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Get your connection string
3. Whitelist your IP address

### 3. Configure Environment Variables

#### Frontend (.env in /frontend)
Create a `.env` file in the frontend directory with your Firebase configuration. See `frontend/.env.example` for the required variables.

#### Backend (.env in /backend)
Create a `.env` file in the backend directory with your database and Firebase Admin SDK configuration. See `backend/.env.example` for the required variables.

### 4. Run the Application

```bash
# Development (runs both frontend and backend)
npm run dev

# Production build
npm run build
npm start
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:4000
- API Documentation: http://localhost:4000/api/docs

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run dev:frontend` - Start only frontend
- `npm run dev:backend` - Start only backend  
- `npm run build` - Build both applications for production
- `npm run clean` - Remove all node_modules and build directories
- `npm run install:all` - Install dependencies for all packages

### Project Structure

#### Frontend (`/frontend`)
- Built with Vite + React + TypeScript
- Tailwind CSS + Radix UI components
- Firebase Authentication integration
- Socket.IO client for real-time features
- State management with React Context

#### Backend (`/backend`)
- Express.js + TypeScript
- MongoDB with Mongoose ODM
- Firebase Admin SDK for token verification
- Socket.IO server for real-time communication
- RESTful API with validation

## 🚀 Deployment

### Frontend Deployment (Netlify/Vercel)
1. Build the frontend: `cd frontend && npm run build`
2. Deploy the `frontend/dist` directory
3. Configure environment variables in your hosting provider
4. Update CORS_ORIGIN in backend environment

### Backend Deployment (Railway/Render/Fly.io)
1. Deploy the backend directory
2. Configure environment variables
3. Ensure MongoDB Atlas allows connections from your hosting provider
4. Update CORS_ORIGIN to your frontend domain

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 📝 API Documentation

Once the backend is running, visit http://localhost:4000/api/docs for interactive API documentation.

### Main Endpoints
- `POST /api/auth/verify` - Verify Firebase token
- `GET /api/users/profile` - Get user profile
- `GET /api/listings` - Get all listings
- `POST /api/listings` - Create new listing
- `GET /api/chats` - Get user's chats
- `POST /api/messages` - Send message

## 🔧 Configuration

### Firebase Security Rules
Update your Firebase Authentication settings:
- Enable Email/Password provider
- Configure authorized domains
- Set up custom claims for admin users (optional)

### MongoDB Indexes
The application will automatically create necessary indexes on startup.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and ensure build passes
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
