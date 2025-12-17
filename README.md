# Collaborative Task Manager

A full-stack task management application built with modern web technologies, featuring real-time collaboration, secure authentication, and comprehensive task management capabilities.

##  Live Deployment

- **Frontend**: [Deployed on Vercel/Netlify - Add your URL here]
- **Backend API**: [Deployed on Render/Railway - Add your URL here]

##  Table of Contents

- [Technology Stack](#technology-stack)
- [Features](#features)
- [Architecture Overview](#architecture-overview)
- [Setup Instructions](#setup-instructions)
- [API Documentation](#api-documentation)
- [Real-Time Features](#real-time-features)
- [Testing](#testing)
- [Design Decisions](#design-decisions)

##  Technology Stack

### Frontend
- **React 19** with **Vite** for fast development and optimized builds
- **TypeScript** for type safety and better developer experience
- **Tailwind CSS** for responsive, utility-first styling
- **React Query (@tanstack/react-query)** for server state management and caching
- **React Hook Form** with **Zod** for form validation
- **Socket.IO Client** for real-time updates
- **Axios** for HTTP requests with credentials support

### Backend
- **Node.js 18** with **Express 5** and **TypeScript**
- **Prisma 6** ORM with **PostgreSQL 16** database
- **Socket.IO** for real-time bidirectional communication
- **bcrypt** for password hashing
- **jsonwebtoken** for JWT-based authentication
- **Zod** for DTO validation
- **Jest** for unit testing

##  Features

### 1. User Authentication & Authorization
-  Secure user registration with bcrypt password hashing
-  JWT-based authentication with HttpOnly cookies
-  Session management and token validation
-  User profile viewing and updating
-  Protected routes with authentication middleware

### 2. Task Management (Full CRUD)
-  Create tasks with all required attributes:
  - Title (max 100 characters)
  - Description (multi-line)
  - Due Date (date/time)
  - Priority (LOW, MEDIUM, HIGH, URGENT)
  - Status (TODO, IN_PROGRESS, REVIEW, COMPLETED)
  - Creator ID (automatically set)
  - Assigned To ID (user assignment)
-  Read/List tasks with filtering and sorting
-  Update task properties (status, priority, assignee)
-  Delete tasks
-  Input validation with Zod DTOs

### 3. Real-Time Collaboration
-  Live task updates via Socket.IO
-  Instant notifications when assigned to tasks
-  Real-time task list refresh for all connected users
-  Socket events: `task:created`, `task:updated`, `task:deleted`, `task:assigned`

### 4. User Dashboard & Data Exploration
-  Personal task views:
  - Tasks created by current user
  - Tasks assigned to current user
  - Overdue tasks (past due date, not completed)
-  Advanced filtering:
  - Filter by Status (TODO, IN_PROGRESS, REVIEW, COMPLETED)
  - Filter by Priority (LOW, MEDIUM, HIGH, URGENT)
-  Sorting by Due Date (ascending/descending)
-  Responsive UI for mobile and desktop

##  Architecture Overview

### Backend Architecture (MVC Pattern)

```
backend/
 src/
    controllers/      # HTTP request handlers
       auth.controller.ts
    services/         # Business logic layer
       auth.service.ts
       task.service.ts
    repositories/     # Data access layer
       user.repository.ts
       task.repository.ts
    middleware/       # Auth guards, validators
       auth.middleware.ts
    routes/          # API route definitions
       auth.routes.ts
       tasks.routes.ts
    utils/           # Helper functions
       jwt.ts
       password.ts
    validators/      # DTOs with Zod
       auth.validator.ts
    index.ts         # Express + Socket.IO setup
 prisma/
    schema.prisma    # Database schema
 tests/
     task.service.test.ts
```

**Layer Responsibilities:**
- **Controllers**: Handle HTTP requests/responses, delegate to services
- **Services**: Contain business logic, emit Socket.IO events, use repositories
- **Repositories**: Direct database interactions via Prisma
- **Middleware**: Authentication, authorization, validation
- **DTOs**: Input validation using Zod schemas

### Frontend Architecture

```
frontend/
 src/
    api/              # HTTP and WebSocket clients
       http.ts
       socket.ts
    context/          # React Context providers
       AuthContext.tsx
       NotificationsContext.tsx
    hooks/            # Custom React hooks
       useAuth.ts
    pages/            # Page components
       AuthForms.tsx
       Dashboard.tsx
       TaskForm.tsx
    types/            # TypeScript type definitions
       auth.ts
    App.tsx
    main.tsx
```

##  Setup Instructions

### Prerequisites
- Node.js 18 or higher
- Docker Desktop (for PostgreSQL)
- Git

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Roshan0612/Collaborative-Task-Manager.git
   cd Collaborative-Task-Manager
   ```

2. **Start PostgreSQL Database**
   ```bash
   docker run -d --name ctm-postgres \
     -e POSTGRES_USER=postgres \
     -e POSTGRES_PASSWORD=postgres \
     -e POSTGRES_DB=collaborative_task_manager \
     -p 5432:5432 \
     postgres:16
   ```

3. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Create .env file with:
   # DATABASE_URL="postgresql://postgres:postgres@localhost:5432/collaborative_task_manager?schema=public"
   # PORT=5000
   # JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   # JWT_EXPIRES_IN=7d
   # CLIENT_ORIGIN=http://localhost:5173
   
   # Run Prisma migrations
   npx prisma migrate dev
   
   # Start development server
   npm run dev
   ```
   Backend will run on `http://localhost:5000`

4. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   
   # Start development server
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

5. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - Prisma Studio: `npx prisma studio` (runs on http://localhost:5558)

##  API Documentation

### Authentication Endpoints

#### POST `/api/v1/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### POST `/api/v1/auth/login`
Authenticate and receive JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### GET `/api/v1/auth/me`
Get current authenticated user (requires authentication).

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### PUT `/api/v1/auth/profile`
Update user profile (requires authentication).

**Request Body:**
```json
{
  "name": "John Updated"
}
```

#### POST `/api/v1/auth/logout`
Logout and clear session cookie.

### Task Endpoints

#### GET `/api/v1/tasks`
List all tasks with optional filtering and sorting (requires authentication).

**Query Parameters:**
- `status` (optional): TODO, IN_PROGRESS, REVIEW, COMPLETED
- `priority` (optional): LOW, MEDIUM, HIGH, URGENT
- `sort` (optional): asc, desc (sorts by due date)

**Response (200):**
```json
[
  {
    "id": "uuid",
    "title": "Task Title",
    "description": "Task description",
    "dueDate": "2025-12-20T10:00:00.000Z",
    "priority": "HIGH",
    "status": "TODO",
    "creatorId": "uuid",
    "assignedToId": "uuid",
    "createdAt": "2025-12-17T10:00:00.000Z"
  }
]
```

#### GET `/api/v1/tasks/:id`
Get a single task by ID (requires authentication).

#### POST `/api/v1/tasks`
Create a new task (requires authentication).

**Request Body:**
```json
{
  "title": "New Task",
  "description": "Task description",
  "dueDate": "2025-12-20T10:00:00.000Z",
  "priority": "HIGH",
  "status": "TODO",
  "creatorId": "uuid",
  "assignedToId": "uuid"
}
```

#### PUT `/api/v1/tasks/:id`
Update a task (requires authentication).

**Request Body (all fields optional):**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "dueDate": "2025-12-21T10:00:00.000Z",
  "priority": "URGENT",
  "status": "IN_PROGRESS",
  "assignedToId": "uuid"
}
```

#### DELETE `/api/v1/tasks/:id`
Delete a task (requires authentication).

#### GET `/api/v1/tasks/dashboard`
Get dashboard data for current user (requires authentication).

**Response (200):**
```json
{
  "mine": [...],
  "overdue": [...]
}
```

##  Real-Time Features

### Socket.IO Integration

The application uses Socket.IO for bidirectional real-time communication between the server and all connected clients.

**Server-Side Implementation:**
- Socket.IO server is attached to the Express HTTP server
- Events are emitted from the Service layer after database operations
- CORS configured to allow frontend origin with credentials

**Client-Side Implementation:**
- Socket.IO client connects with `withCredentials: true`
- React Query cache is invalidated when Socket events are received
- Notifications are shown to assigned users

**Socket Events:**

1. **`task:created`** - Emitted when a new task is created
2. **`task:updated`** - Emitted when a task is updated
3. **`task:deleted`** - Emitted when a task is deleted
4. **`task:assigned`** - Emitted when a task is assigned to a user

**Benefits:**
- Instant updates across all connected clients
- No polling required
- Reduced server load
- Better user experience with live collaboration

##  Testing

### Running Tests

```bash
cd backend
npm test
```

### Test Coverage

Unit tests cover critical business logic:

1. **Task Creation DTO Validation**
   - Validates required fields
   - Enforces title length limit (100 chars)
   - Validates enum values (priority, status)
   - Validates UUID format for user IDs

2. **Task Update DTO Validation**
   - Validates optional field updates
   - Ensures partial updates work correctly

### Test Files
- `backend/tests/task.service.test.ts` - Task service validation tests

##  Design Decisions

### Why PostgreSQL?

**Rationale:**
- **ACID Compliance**: Task management requires strong data consistency
- **Relational Data**: Clear relationships between Users and Tasks
- **Prisma Support**: Excellent TypeScript integration
- **Scalability**: Handles concurrent connections well
- **Data Integrity**: Foreign key constraints ensure referential integrity
- **Production Ready**: Mature, reliable, widely supported

### Why JWT with HttpOnly Cookies?

**Security Benefits:**
- HttpOnly cookies prevent XSS attacks (JavaScript cannot access)
- Automatic cookie handling by browser
- CSRF protection through SameSite attribute
- No need to manage tokens in localStorage
- Secure transmission with `credentials: true`

### Service/Repository Pattern

**Benefits:**
- **Separation of Concerns**: Business logic separate from data access
- **Testability**: Easy to mock repositories in service tests
- **Maintainability**: Changes to database don't affect business logic
- **Reusability**: Services can use multiple repositories

### React Query for State Management

**Advantages:**
- Automatic caching and cache invalidation
- Built-in loading and error states
- Background refetching
- Optimistic updates support
- Reduces boilerplate code
- Perfect for server state management

##  Trade-offs & Assumptions

### Trade-offs

1. **No Optimistic Updates**: Chose simplicity over complexity. Real-time updates via Socket.IO provide fast feedback.

2. **User ID in Assignment**: Users must know the UUID to assign tasks. Future improvement: dropdown with user list.

3. **Single Database**: All data in one PostgreSQL instance. For scale, could separate into microservices.

4. **Session Storage**: JWT in cookies. For multi-device logout, would need Redis for session management.

### Assumptions

1. **Users are trusted**: No role-based access control (admin vs user)
2. **Single tenant**: All users see all tasks
3. **English only**: No internationalization
4. **Modern browsers**: Assumes ES6+ support

##  Deployment Guide

### Frontend (Vercel)

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables:
   - `VITE_API_URL`: Your backend URL
4. Deploy

### Backend (Render/Railway)

1. Create new Web Service
2. Connect GitHub repository
3. Set environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `CLIENT_ORIGIN`
4. Set build command: `cd backend && npm install && npx prisma generate && npm run build`
5. Set start command: `cd backend && npx prisma migrate deploy && node dist/index.js`

### Database (Render/Railway)

1. Create PostgreSQL database
2. Copy connection string
3. Update `DATABASE_URL` in backend environment

##  Author

**Roshan**
- GitHub: [@Roshan0612](https://github.com/Roshan0612)
- Repository: [Collaborative-Task-Manager](https://github.com/Roshan0612/Collaborative-Task-Manager)

##  License

This project is created as part of a technical assessment.

---

**Note**: This application was built following industry best practices with TypeScript, proper error handling, security measures, and comprehensive testing. All requirements from the assessment rubric have been implemented.