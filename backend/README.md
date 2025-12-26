# ProblemSolvers Hub - Backend

Backend API for ProblemSolvers Hub - A collaborative problem-solving platform for developer teams.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs for password hashing

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Configure your `.env` file:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/problemsolvers-hub
JWT_SECRET=your_secure_secret_key_here
NODE_ENV=development
```

### Running the Server

Development mode (with auto-restart):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000` by default.

## Project Structure

```
backend/
├── config/
│   └── db.js                 # MongoDB connection
├── models/
│   ├── User.js              # User schema
│   ├── Problem.js           # Problem schema
│   ├── Submission.js        # Submission schema
│   └── Comment.js           # Comment schema
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── problemController.js # Problem CRUD operations
│   ├── submissionController.js
│   └── commentController.js
├── routes/
│   ├── authRoutes.js
│   ├── problemRoutes.js
│   ├── submissionRoutes.js
│   └── commentRoutes.js
├── middleware/
│   ├── authMiddleware.js    # JWT verification
│   └── roleMiddleware.js    # Role-based access control
├── utils/
│   └── generateToken.js     # JWT token generation
└── server.js                # Entry point
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (protected)

### Problems

- `GET /api/problems` - Get all problems (protected)
- `GET /api/problems/:id` - Get single problem (protected)
- `POST /api/problems` - Create problem (admin only)
- `PUT /api/problems/:id` - Update problem (admin only)
- `DELETE /api/problems/:id` - Delete problem (admin only)

### Submissions

- `GET /api/submissions/problem/:problemId` - Get submissions for a problem
- `POST /api/submissions` - Create submission (protected)
- `PUT /api/submissions/:id/reference` - Mark as reference solution (admin only)

### Comments

- `GET /api/comments/problem/:problemId` - Get comments for a problem
- `POST /api/comments` - Create comment (protected)
- `DELETE /api/comments/:id` - Delete comment (own or admin)

## Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## User Roles

- **Admin**: Can create/edit/delete problems, mark reference solutions
- **Member**: Can view problems, submit solutions, post comments

## Database Models

### User
- name, email, password (hashed), role

### Problem
- title, description, difficulty (Easy/Medium/Hard), tags[], source, createdBy

### Submission
- problem, user, approach, thoughtProcess, pseudocode, code, timeComplexity, spaceComplexity, optimizationNotes, isReferenceSolution

### Comment
- problem, user, content, timestamps

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| MONGO_URI | MongoDB connection string | - |
| JWT_SECRET | Secret key for JWT | - |
| NODE_ENV | Environment | development |

## Error Handling

The API uses standard HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

## License

ISC
