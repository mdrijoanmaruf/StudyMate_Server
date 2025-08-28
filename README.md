# StudyMate Server

Backend API server for the StudyMate application built with Express.js and MongoDB.

## Features

- **Budget Tracker API**: CRUD operations for financial transactions
- **Class Schedule API**: CRUD operations for class schedules
- **User Authentication**: Firebase authentication integration
- **MongoDB Integration**: Persistent data storage

## API Endpoints

### Budget Tracker
- `GET /api/transactions/:userId` - Get all transactions for a user
- `POST /api/transactions` - Add a new transaction
- `PUT /api/transactions/:id` - Update a transaction
- `DELETE /api/transactions/:id` - Delete a transaction

### Class Schedule
- `GET /api/classes/:userId` - Get all classes for a user
- `POST /api/classes` - Add a new class
- `PUT /api/classes/:id` - Update a class
- `DELETE /api/classes/:id` - Delete a class

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
URI=your_mongodb_connection_string
PORT=5000
```

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Start production server:
```bash
npm start
```

## Deployment to Vercel

1. Install Vercel CLI globally:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy to Vercel:
```bash
vercel --prod
```

4. Set environment variables in Vercel dashboard:
   - `URI`: Your MongoDB connection string
   - `NODE_ENV`: production

## Project Structure

```
├── index.js          # Main server file
├── package.json      # Dependencies and scripts
├── vercel.json       # Vercel deployment configuration
├── .vercelignore     # Files to ignore during deployment
└── .env              # Environment variables (not in repo)
```

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **Deployment**: Vercel
- **Authentication**: Firebase Auth