# Strategist Application Architecture

## Overview

Strategist is a Flask-based backend application that helps users set goals, track progress, and receive AI guidance through the Sensay API. The application follows a modular design with clear separation of concerns between different components.

## Architecture Components

### Core Structure

- **Flask Application**: The main application framework providing HTTP routing and request handling.
- **SQLAlchemy ORM**: Provides database functionality and object-relational mapping.
- **JWT Authentication**: Handles user authentication and authorization.
- **Blueprint-based API**: Organizes endpoints into logical groupings.
- **Sensay AI Integration**: Connects with Sensay API for AI replica functionality.

### Directory Structure

```
strategist/
├── app/                        # Main application package
│   ├── __init__.py             # Application factory
│   ├── models.py               # Database models
│   ├── api/                    # API endpoints
│   │   ├── __init__.py
│   │   ├── auth.py             # Authentication endpoints
│   │   ├── goals.py            # Goal management endpoints
│   │   ├── progress.py         # Progress tracking endpoints
│   │   └── chat.py             # AI chat endpoints
│   └── services/               # Service modules
│       ├── __init__.py
│       └── sensay.py           # Sensay API client
├── app.py                      # Application entry point
├── test_app.py                 # Application test script
├── requirements.txt            # Python dependencies
├── env.example                 # Example environment variables
└── README.md                   # Documentation
```

## Data Models

The application uses a relational database with the following key models:

1. **User**
   - Core user information and authentication details
   - One-to-many relationship with goals, preferences, and chat history

2. **UserPreference**
   - User-specific settings and preferences
   - One-to-one relationship with user

3. **Goal**
   - Strategic goals with title, description, importance, and timeline
   - Self-referential relationship for hierarchical goals (subgoals)
   - One-to-many relationship with milestones, reflections, and progress updates

4. **Milestone**
   - Key steps within a goal with title, description, and timeline
   - Many-to-one relationship with goal

5. **ProgressUpdate**
   - Progress tracking for goals with completion percentage and notes
   - Many-to-one relationship with goal

6. **Reflection**
   - User reflections on goals (importance, obstacles, strategies)
   - Many-to-one relationship with goal

7. **ChatMessage**
   - Messages between user and AI replica
   - Many-to-one relationship with user and optional relationship with goal

## API Design

The API follows RESTful principles with the following main endpoints:

1. **Authentication API** (`/api/auth/...`)
   - User registration, login, and profile management

2. **Goals API** (`/api/goals/...`)
   - Goal CRUD operations
   - Milestone management
   - Reflection management 

3. **Progress API** (`/api/progress/...`)
   - Progress updates
   - Progress summary and statistics

4. **Chat API** (`/api/chat/...`)
   - AI replica conversation
   - Goal analysis and recommendations

## Sensay AI Integration

The application integrates with Sensay AI through the following components:

1. **SensayAPI Client**
   - Python wrapper for the Sensay API
   - Handles authentication, error handling, and request formatting

2. **Replica Management**
   - Creates and manages user-specific replicas
   - Configures system messages for the strategic planning focus

3. **Chat Functionality**
   - Handles messaging between users and the AI replica
   - Stores conversation history for context

4. **Goal Analysis**
   - Uses AI to analyze goals and provide insights
   - Generates recommendations for goal improvement

## Security Considerations

1. **Authentication**
   - JWT-based authentication for secure API access
   - Password hashing for user security

2. **Authorization**
   - User-specific data access controls
   - Route protection with JWT verification

3. **Environment Configuration**
   - Sensitive configuration stored in environment variables
   - Example configuration provided without sensitive values

## Future Enhancements

1. **Frontend Integration**
   - Integration with a modern frontend framework (React, Vue, etc.)
   - Real-time updates with WebSockets or Server-Sent Events

2. **Advanced Analytics**
   - Goal progress prediction
   - Pattern recognition in user goal behavior

3. **Integration Expansions**
   - Calendar integration for deadlines
   - Notification services (email, SMS, etc.)
   - Export/import functionality

4. **AI Enhancements**
   - Custom-trained replica models
   - Personalized goal recommendations
   - Progress forecasting 