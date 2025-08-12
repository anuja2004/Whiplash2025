# Whiplash2025 - AI-Powered Learning Management System

A next-generation Learning Management System that combines traditional LMS functionality with AI-powered features, inspired by roadmap.sh's structured learning approach and Duolingo's engaging user experience.

## 🚀 Project Overview

Whiplash2025 is a full-stack educational platform that provides:
- **Structured Learning Paths** - Like roadmap.sh but interactive
- **AI-Powered Personalization** - Adaptive learning experiences
- **Gamification Elements** - Duolingo-style engagement mechanics
- **Microservices Architecture** - Scalable backend services
- **Real-time Collaboration** - Live learning sessions and notifications

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React.js with Vite, TailwindCSS
- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Microservices**: Python-based AI services
- **Containerization**: Docker & Docker Compose
- **Real-time**: Socket.io for live features

### System Architecture
```
┌─────────────────────────────────────────┐
│           Frontend (React)              │
├─────────────────────────────────────────┤
│           Backend API                   │
├─────────────────────────────────────────┤
│        Microservices Layer            │
│  ├─ Material Generator               │
│  ├─ Quiz Generator                  │
│  ├─ Video Fetcher                   │
│  ├─ Study Material Generator        │
│  └─ Learning Orchestrator           │
└─────────────────────────────────────────┘
```

## 🎯 Key Features

### Learning Management
- **Course Management** - Create, edit, and organize courses
- **Learning Paths** - Visual roadmap-style learning progression
- **Progress Tracking** - Detailed analytics and achievements
- **Assignment System** - Submit and grade assignments

### AI Integration
- **Personalized Content** - AI-generated study materials
- **Smart Quizzes** - Adaptive difficulty based on performance
- **Video Recommendations** - Curated educational content
- **Learning Insights** - AI-powered progress analysis

### User Experience
- **Dashboard** - Personalized learning overview
- **Calendar Integration** - Schedule and track learning sessions
- **Notes System** - Rich text and collaborative notes
- **Notifications** - Real-time updates and reminders

## 🛠️ Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v5.0 or higher)
- Docker & Docker Compose
- Python 3.8+ (for microservices)

### Installation

1. **Clone the repository**
```bash
git clone [repository-url]
cd Whiplash2025
```

2. **Install dependencies**
```bash
# Backend dependencies
cd Backend
npm install

# Frontend dependencies
cd ../Frontend/web-app-frontend
npm install

# Microservices dependencies
cd ../../microservices_backend
pip install -r requirements.txt
```

3. **Environment Setup**
```bash
# Copy environment variables
cp Backend/.env.example Backend/.env
# Edit .env with your configuration
```

4. **Start the services**
```bash
# Using Docker Compose (recommended)
docker-compose up -d

# Or start manually
cd Backend && npm run dev
cd Frontend/web-app-frontend && npm run dev
```

## 📁 Project Structure

```
Whiplash2025/
├── Backend/                 # Main Node.js API
│   ├── controllers/        # Route controllers
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   └── middleware/        # Auth & validation
├── Frontend/
│   └── web-app-frontend/  # React application
├── microservices_backend/ # Python AI services
├── docker-compose.yml     # Container orchestration
└── README.md
```

## 🔧 Development

### Available Scripts

**Backend:**
```bash
npm run dev          # Development server
npm run start        # Production server
npm run test         # Run tests
npm run seed         # Seed database
```

**Frontend:**
```bash
npm run dev          # Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

### API Documentation

The API documentation is available at:
- **Development**: http://localhost:5000/api-docs
- **Production**: [your-domain]/api-docs

### Database Schema

Key collections:
- **Users**: Student/teacher profiles
- **Courses**: Course metadata and content
- **Progress**: User learning progress
- **Assignments**: Assignment submissions
- **Quizzes**: Quiz data and results


## 🚀 Deployment

### Docker Deployment
```bash
# Build and run all services
docker-compose up --build

# Production deployment
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables
Required environment variables:
```bash
# Backend
MONGODB_URI=mongodb://localhost:27017/whiplash
JWT_SECRET=your-secret-key
PORT=5000

# Frontend
VITE_API_URL=http://localhost:5000/api

# Microservices
GEMINI_API_KEY=your-gemini-key

