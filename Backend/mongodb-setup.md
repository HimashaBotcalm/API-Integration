# MongoDB Compass Setup Guide

## Database Structure

### Database Name: `api_project`

### Collection: `users`

## User Document Structure

```json
{
  "_id": "ObjectId",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "hashed_password",
  "age": 25,
  "gender": "male",
  "phone": "+1234567890",
  "avatar": null,
  "isActive": true,
  "isEmailVerified": false,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "lastLogin": "2024-01-01T00:00:00.000Z"
}
```

## MongoDB Compass Setup Steps

1. **Open MongoDB Compass**
2. **Connect to your MongoDB instance** (usually `mongodb://localhost:27017`)
3. **Create Database:**
   - Click "Create Database"
   - Database Name: `api_project`
   - Collection Name: `users`

4. **Create Indexes for Performance:**
   - Select the `users` collection
   - Go to "Indexes" tab
   - Create these indexes:
     ```json
     { "email": 1 }  // Unique index for email
     { "isActive": 1 }  // Index for active users
     { "createdAt": -1 }  // Index for sorting by creation date
     ```

## Sample User Documents

You can insert these sample documents for testing:

```json
[
  {
    "name": "Admin User",
    "email": "admin@test.com",
    "password": "$2a$12$example_hashed_password",
    "age": 30,
    "gender": "prefer-not-to-say",
    "phone": "+1234567890",
    "isActive": true,
    "isEmailVerified": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  {
    "name": "Test User",
    "email": "test@test.com",
    "password": "$2a$12$example_hashed_password",
    "age": 25,
    "gender": "male",
    "phone": "+0987654321",
    "isActive": true,
    "isEmailVerified": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

## Environment Variables

Make sure your `.env` file contains:

```
MONGO_URI=mongodb://localhost:27017/api_project
PORT=5000
```

## API Endpoints

- **POST** `/auth/signup` - Register new user
- **POST** `/auth/login` - User login
- **GET** `/users` - Get all active users
- **PUT** `/users/:id` - Update user
- **DELETE** `/users/:id` - Delete user

## Field Validations

- **name**: Required, min 2 characters
- **email**: Required, unique, valid email format
- **password**: Required, min 6 characters (auto-hashed)
- **age**: Optional, 13-120 years
- **gender**: Optional, enum values
- **phone**: Optional string
- **isActive**: Boolean, default true
- **isEmailVerified**: Boolean, default false