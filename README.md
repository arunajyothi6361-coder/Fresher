# Virtual Classroom Platform using AEB Technology

A comprehensive virtual classroom platform built with AEB (Advanced Educational Backend) technology to enable seamless online learning experiences.

## Features

- **Real-time Collaboration**: Live video/audio streaming with AEB integration
- **Interactive Whiteboard**: Digital whiteboard for collaborative learning
- **Screen Sharing**: Share screens for demonstrations and presentations
- **Assignment Management**: Create, distribute, and grade assignments
- **Attendance Tracking**: Automatic attendance logging
- **Chat & Notifications**: Real-time messaging and notifications
- **Recording & Playback**: Record sessions for later review
- **Student Progress Analytics**: Track and analyze student performance

## Technology Stack

- **Frontend**: React.js / Vue.js
- **Backend**: Node.js / Python Flask
- **Database**: PostgreSQL / MongoDB
- **Real-time Communication**: WebSocket / Socket.io
- **AEB Integration**: Advanced Educational Backend APIs
- **Deployment**: Docker, Kubernetes

## Project Structure

```
virtual-classroom/
├── frontend/              # React/Vue frontend application
├── backend/               # Node.js/Python backend server
├── database/              # Database schemas and migrations
├── config/                # Configuration files
├── docs/                  # Documentation
└── tests/                 # Test files
```

## Getting Started

### Prerequisites

- Node.js v16+
- Python 3.8+ (if using Python backend)
- PostgreSQL 12+
- Docker (optional)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/arunajyothi6361-coder/Fresher.git
cd Fresher
```

2. Install dependencies:
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
pip install -r requirements.txt  # or npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development server:
```bash
# Terminal 1 - Backend
cd backend
npm start  # or python app.py

# Terminal 2 - Frontend
cd frontend
npm start
```

## API Documentation

### Key Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

#### Classroom Management
- `GET /api/classrooms` - List all classrooms
- `POST /api/classrooms` - Create new classroom
- `GET /api/classrooms/:id` - Get classroom details
- `PUT /api/classrooms/:id` - Update classroom
- `DELETE /api/classrooms/:id` - Delete classroom

#### Session Management
- `POST /api/sessions/start` - Start a classroom session
- `GET /api/sessions/:id` - Get session details
- `POST /api/sessions/:id/join` - Join a session
- `POST /api/sessions/:id/leave` - Leave a session
- `POST /api/sessions/:id/end` - End a session

#### Assignments
- `POST /api/assignments` - Create assignment
- `GET /api/assignments` - List assignments
- `POST /api/assignments/:id/submit` - Submit assignment
- `GET /api/assignments/:id/submissions` - View submissions

## AEB Technology Integration

The platform leverages AEB (Advanced Educational Backend) for:

- Educational content delivery
- Student assessment and analytics
- Learning path personalization
- AI-powered recommendations
- Compliance and security standards

### AEB Configuration

```javascript
// config/aeb.config.js
module.exports = {
  apiKey: process.env.AEB_API_KEY,
  apiEndpoint: process.env.AEB_API_ENDPOINT,
  features: {
    contentDelivery: true,
    analytics: true,
    personalization: true,
    compliance: true
  }
};
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role ENUM('admin', 'instructor', 'student'),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Classrooms Table
```sql
CREATE TABLE classrooms (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  instructor_id UUID REFERENCES users(id),
  capacity INT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Sessions Table
```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY,
  classroom_id UUID REFERENCES classrooms(id),
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  status ENUM('scheduled', 'active', 'completed'),
  recording_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Testing

Run tests with:

```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
npm test  # or pytest
```

## Deployment

### Docker Deployment

```bash
# Build images
docker build -f Dockerfile.backend -t classroom-backend:latest .
docker build -f Dockerfile.frontend -t classroom-frontend:latest .

# Run containers
docker run -p 5000:5000 classroom-backend:latest
docker run -p 3000:3000 classroom-frontend:latest
```

### Kubernetes Deployment

See `k8s/` directory for Kubernetes manifests.

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m 'Add your feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or suggestions, please open an issue on GitHub or contact the development team.

## Authors

- Arunajyothi (arunajyothi6361-coder)

## Acknowledgments

- AEB Technology for educational backend services
- Open-source community contributions