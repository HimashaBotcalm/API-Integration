# Backend API - MongoDB Setup

## Database Configuration

### MongoDB Connection
- **Database Name**: `API_Integration`
- **Connection URI**: `mongodb://localhost:27017/API_Integration`
- **Port**: 27017 (default MongoDB port)

### User Collection Schema
The `users` collection handles both signup and login functionality with the following fields:

#### Authentication Fields
- `name` (String, required): User's full name
- `email` (String, required, unique): User's email address
- `password` (String, required): Hashed password (min 6 characters)

#### Profile Fields
- `age` (Number, optional): User's age (13-120)
- `gender` (String, optional): male, female, other, prefer-not-to-say
- `phone` (String, optional): User's phone number
- `avatar` (String, optional): Profile picture URL

#### Status Fields
- `isActive` (Boolean): Account status (default: true)
- `isEmailVerified` (Boolean): Email verification status (default: false)
- `createdAt` (Date): Account creation timestamp
- `updatedAt` (Date): Last update timestamp
- `lastLogin` (Date): Last login timestamp

## API Endpoints

### Authentication Routes

#### Signup
```
POST /auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "age": 25,
  "gender": "male",
  "phone": "+1234567890"
}
```

#### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Health Check Routes

#### Basic Health Check
```
GET /
```

#### Database Health Check
```
GET /health
```

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start MongoDB**
   Make sure MongoDB is running on your system:
   ```bash
   # Windows (if MongoDB is installed as service)
   net start MongoDB
   
   # Or start manually
   mongod
   ```

3. **Test Database Connection**
   ```bash
   npm run test-db
   ```

4. **Start Server**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

## Environment Variables

Create a `.env` file in the Backend directory:
```
MONGO_URI=mongodb://localhost:27017/API_Integration
PORT=5000
```

## Security Features

- Password hashing using bcryptjs
- Email uniqueness validation
- Input validation and sanitization
- Error handling for duplicate emails
- Account status checking

## Testing

Run the database test to verify everything is working:
```bash
npm run test-db
```

This will:
- Test MongoDB connection
- Validate User model
- Check database operations
- Report any issues