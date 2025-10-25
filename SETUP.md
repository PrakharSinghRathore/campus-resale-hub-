# Campus Resale Hub - Complete Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm 8+
- MongoDB Atlas account (or local MongoDB)
- Firebase project with Authentication enabled

### 1. Install Dependencies
```bash
# Install root and all sub-project dependencies
npm run install:all
```

### 2. Firebase Setup

#### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project called "Campus Resale Hub"
3. Enable Authentication > Email/Password provider
4. Go to Project Settings > Web Apps > Add app
5. Copy the configuration object

#### Generate Service Account
1. Go to Project Settings > Service Accounts
2. Click "Generate new private key"
3. Save the JSON file (contains private key, client email, etc.)

### 3. MongoDB Atlas Setup

1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster (free tier is fine)
3. Create a database user
4. Whitelist your IP address (0.0.0.0/0 for development)
5. Get connection string

### 4. Environment Configuration

#### Frontend (.env)
Create `frontend/.env` with your Firebase configuration. Copy from `frontend/.env.example` and fill in your actual values.

#### Backend (.env)
Create `backend/.env` with your database and Firebase Admin SDK configuration. Copy from `backend/.env.example` and fill in your actual values.

### 5. Run the Application

#### Development Mode (Both frontend and backend)
```bash
npm run dev
```

#### Individual Services
```bash
# Frontend only
npm run dev:frontend

# Backend only  
npm run dev:backend
```

#### Production Build
```bash
npm run build
npm start
```

## 📍 Application URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000
- **API Documentation**: http://localhost:4000/api/docs
- **Health Check**: http://localhost:4000/health

## 🔧 Features Implemented

### ✅ Authentication
- Firebase Authentication with Email/Password
- University email validation (.edu domains)
- JWT token verification on backend
- User profile management

### ✅ Real-time Messaging
- Socket.IO integration
- Chat rooms and direct messaging  
- Typing indicators
- Online/offline presence
- Message read receipts

### ✅ Marketplace Features
- Product listings with images
- Search and filtering (category, condition, hostel block)
- Favorites system
- User ratings and reviews

### ✅ Backend API
- RESTful API with Express.js + TypeScript
- MongoDB with Mongoose ODM
- Firebase Admin SDK integration
- Rate limiting and security middleware
- Comprehensive error handling

### ✅ Database Models
- **User**: Profile, preferences, favorites
- **Listing**: Products with metadata
- **Chat**: Group and direct conversations
- **Message**: Text, images, system messages

## 🛠️ Development Commands

```bash
# Install all dependencies
npm run install:all

# Development with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Clean build artifacts
npm run clean

# Type checking
cd backend && npm run lint
```

## 🔐 Security Features

- Firebase ID token verification
- CORS protection
- Helmet security headers  
- Rate limiting (100 requests per 15 minutes in production)
- Input validation with Zod
- MongoDB injection protection
- User permission checking

## 📊 API Endpoints

### Authentication
- `POST /api/auth/verify` - Verify Firebase token
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/:id` - Get user by ID

### Listings
- `GET /api/listings` - Get all listings (with filters)
- `POST /api/listings` - Create new listing
- `GET /api/listings/:id` - Get listing by ID
- `PUT /api/listings/:id` - Update listing
- `DELETE /api/listings/:id` - Delete listing
- `POST /api/listings/:id/favorite` - Toggle favorite
- `GET /api/listings/favorites` - Get user favorites

### Chats
- `GET /api/chats` - Get user chats
- `POST /api/chats/with` - Get/create chat with user
- `GET /api/chats/:id/messages` - Get chat messages
- `POST /api/chats/:id/messages` - Send message
- `PUT /api/chats/:id/read` - Mark messages as read

### Admin (Admin users only)
- `GET /api/admin/users` - Get all users
- `GET /api/admin/listings` - Get all listings  
- `GET /api/admin/stats` - Get platform statistics

## 🌐 Socket.IO Events

### Client Events
- `join_chat` - Join chat room
- `leave_chat` - Leave chat room
- `send_message` - Send message to chat
- `typing_start` - Start typing indicator
- `typing_stop` - Stop typing indicator

### Server Events  
- `new_message` - New message received
- `user_typing` - User started typing
- `user_stopped_typing` - User stopped typing
- `user_online` - User came online
- `user_offline` - User went offline

## 🚀 Deployment

### Frontend (Netlify/Vercel)
1. Build: `cd frontend && npm run build`
2. Deploy `frontend/dist` directory
3. Set environment variables in hosting provider
4. Update CORS_ORIGIN in backend

### Backend (Railway/Render/Fly.io)
1. Deploy backend directory
2. Set environment variables
3. Ensure MongoDB Atlas allows hosting provider IPs
4. Update frontend API URLs to production backend

### Environment Variables for Production

#### Frontend Production
```env
VITE_API_URL=https://your-backend-domain.com/api
VITE_SOCKET_URL=https://your-backend-domain.com
# ... other Firebase config
```

#### Backend Production
```env
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com
# ... other config
```

## 📝 Troubleshooting

### Common Issues

#### Firebase Authentication Errors
- Check Firebase project configuration
- Ensure service account has proper permissions
- Verify private key format (escape newlines properly)

#### MongoDB Connection Issues
- Check connection string format
- Ensure IP is whitelisted in Atlas
- Verify database user permissions

#### CORS Issues
- Update CORS_ORIGIN in backend .env
- Check frontend API_URL matches backend

#### Socket.IO Not Working
- Ensure both services are running
- Check SOCKET_URL in frontend .env
- Verify firewall/proxy settings

### Debugging Tips

```bash
# Check backend logs
cd backend && npm run dev

# Check frontend console
# Open browser dev tools > Console

# Test API endpoints
curl http://localhost:4000/health

# Verify MongoDB connection
# Check logs in backend terminal
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Make changes and test thoroughly
4. Commit: `git commit -m "Add feature"`
5. Push: `git push origin feature-name`
6. Create Pull Request

## 📄 License

This project is licensed under the MIT License.

---

## Next Steps

1. **Set up your Firebase and MongoDB accounts**
2. **Configure environment variables** 
3. **Run `npm run dev` to start development**
4. **Test authentication and basic features**
5. **Customize the UI and add your branding**
6. **Deploy to production when ready**

🎉 **You're all set! Happy coding!** 🎉