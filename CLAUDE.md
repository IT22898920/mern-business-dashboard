# CLAUDE.md - Project Development Guide

## Project Overview
MERN stack business dashboard application with inventory management, supplier management, and reorder system.

## Project Structure
```
mern-business-dashboard/
├── backend/           # Node.js/Express API
│   ├── controllers/   # Request handlers
│   ├── models/       # MongoDB models
│   ├── routes/       # API routes
│   └── config/       # Configuration files
├── frontend/         # React application
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/      # Page components
│   │   │   ├── admin/    # Admin pages
│   │   │   └── supplier/ # Supplier pages
│   │   └── App.jsx     # Main app component
└── package.json      # Root package.json
```

## Development Commands

### Backend
```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start

# Run tests (if available)
npm test

# Lint code (if configured)
npm run lint
```

### Frontend
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests (if available)
npm test

# Lint code (if configured)
npm run lint
```

## Database
- MongoDB database
- Models: User, Inventory, ReorderRequest, Supplier

## Key Features
1. **Inventory Management** - Track and manage inventory items
2. **Supplier Management** - Handle supplier applications and management
3. **Reorder System** - Automated reorder requests and responses
4. **Alert System** - Real-time alerts for inventory and orders
5. **Role-based Access** - Admin and Supplier roles with different layouts

## API Endpoints
- `/api/inventory` - Inventory management
- `/api/reorders` - Reorder requests
- `/api/suppliers` - Supplier management
- `/api/auth` - Authentication

## Environment Variables
Ensure these are configured in `.env` files:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT token secret
- `PORT` - Server port
- `EMAIL_*` - Email configuration settings

## Code Quality Checks
Before committing changes, run:
```bash
# Backend checks
cd backend && npm run lint && npm test

# Frontend checks  
cd frontend && npm run lint && npm test
```

## Git Workflow
- Main branch: `main`
- Feature branches: Create from main
- Always run linting and tests before committing

## Recent Changes
- Added ReorderRequest model and controller
- Implemented supplier layout and pages
- Added alert system component
- Enhanced inventory management features