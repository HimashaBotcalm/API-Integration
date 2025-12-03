# API Project Setup Guide

## Quick Start

### 1. Check Current Setup
```bash
node check-setup.js
```

### 2. Start Both Servers (Windows)
```bash
start-dev.bat
```

### 3. Manual Setup

#### Backend Server
```bash
cd Backend
npm install
npm run dev
```
The backend will run on http://localhost:5000

#### Frontend Server
```bash
cd Frontend
npm install
npm run dev
```
The frontend will run on http://localhost:5173

## Troubleshooting "Add Button" Issue

### The "Add Product" button should appear when:
1. ✅ Both backend and frontend servers are running
2. ✅ You are logged in as an admin user
3. ✅ You are on the Products page

### Common Issues:

#### 1. Backend Not Running
- **Symptom**: Can't see products, login doesn't work
- **Solution**: Start backend server with `npm run dev` in Backend folder

#### 2. Not Logged in as Admin
- **Symptom**: Can see products but no "Add Product" button
- **Solution**: 
  - Create an admin user during signup
  - Or check your user role in the database

#### 3. Frontend Not Connected to Backend
- **Symptom**: Loading forever, network errors
- **Solution**: Ensure backend is running on port 5000

### Creating an Admin User

1. Go to http://localhost:5173
2. Click "Sign up"
3. Fill the form and set role to "admin" (if role field is available)
4. Or manually update user role in MongoDB

### Verify Setup
- Backend health: http://localhost:5000/health
- Frontend: http://localhost:5173
- API test: http://localhost:5000/

## Project Structure
```
API-Project/
├── Backend/          # Express.js API server
├── Frontend/         # React + Vite frontend
├── start-dev.bat     # Windows batch script to start both servers
├── check-setup.js    # Setup verification script
└── SETUP-GUIDE.md    # This file
```

## Environment Variables
Make sure you have `.env` files in both Backend and Frontend folders with the required configuration.