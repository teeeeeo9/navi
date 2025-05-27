# Navi - Goal Setting & Strategic Planning App

Navi is a minimalistic app that helps users set meaningful goals, create strategic plans, and track their progress. The app uses Sensay AI technology to provide personalized guidance and assistance throughout the goal-setting and planning process.

## Key Features

- **Goal Setting**: Define clear, meaningful goals with descriptions, timelines, and importance.
- **Conversational Interface**: Interact naturally with an AI assistant that handles all goal-related actions.
- **Hierarchical Goals**: Create nested goals and subgoals for better organization.
- **Milestones**: Break goals into achievable milestones with their own deadlines.
- **Progress Tracking**: Track progress on goals and visualize your journey with charts.
- **Reflections**: Capture thoughts on the importance of goals, potential obstacles, and strategies.
- **AI Assistant**: Chat with an AI assistant trained to help with strategic planning.
- **Knowledge Base Training**: Each replica is automatically trained with strategic planning concepts and methodologies.
- **Dual UI Interaction**: Interact through both chat interface and traditional UI elements, with the AI being aware of changes made in either interface.
- **Animated Visualizations**: Beautiful, animated displays of your goals, milestones, and progress.
- **Glass Morphism UI**: Modern transparent/glass UI elements that create depth and visual appeal.
- **Carousel Goal Navigation**: Intuitive carousel-based navigation for goals.
- **Responsive Design**: Works on all device sizes from mobile to desktop.

## Technology Stack

### Backend
- **Framework**: Python Flask
- **Database**: SQLAlchemy (with SQLite for development)
- **AI Integration**: Sensay API for AI replica creation and interaction
- **Authentication**: JWT-based auth system

### Frontend
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Routing**: React Router
- **Data Fetching**: Axios
- **Data Visualization**: Recharts

## Setup Instructions

### Prerequisites

- Python 3.8 or higher
- Node.js 16+ and npm/yarn
- Sensay API key (from [Sensay API](https://sensay.io))

### Backend Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/navi.git
   cd navi
   ```

2. Create a virtual environment and activate it:
   ```
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the root directory with the following content:
   ```
   FLASK_APP=app
   FLASK_ENV=development
   SECRET_KEY=your_secret_key_here
   JWT_SECRET_KEY=your_jwt_secret_key_here
   SENSAY_API_KEY=your_sensay_api_key_here
   SENSAY_USER_ID_PREFIX=navi_
   SENSAY_REPLICA_SLUG=navi_planning_assistant
   LOG_LEVEL=INFO
   ```

5. Initialize the database:
   ```
   python app.py create_db
   ```

6. Run the database migration to add the replica_id column:
   ```
   python migrations/add_replica_id.py
   ```

### Frontend Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

### Running the Application

1. Start the Flask backend server:
   ```
   flask run
   ```

2. In a separate terminal, start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   # or
   yarn dev
   ```

3. The backend API will be available at `http://localhost:5000/api/`.
4. The frontend will be available at `http://localhost:5173`.
5. To test the backend functionality directly, run the test script:
   ```
   python test_app.py
   ```

## Knowledge Base Training

Each Sensay replica created by the application is automatically trained with strategic planning knowledge. This training happens during replica creation and includes:

- SMART goal-setting methodology
- Reflection best practices
- Milestone planning strategies
- Progress tracking methods
- Obstacle management techniques
- Environment design for goal achievement
- Goal prioritization frameworks
- Adaptation strategies

The knowledge base content can be customized by modifying the entries in `app/knowledge_base.py`.

## API Documentation

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Log in an existing user
- `GET /api/auth/profile` - Get the current user's profile
- `PUT /api/auth/profile` - Update the current user's profile

### Chat

- `GET /api/chat/history` - Get chat history (add `?include_system=true` to include system messages)
- `POST /api/chat/send` - Send a message to the AI replica (all goal management happens through this endpoint)

### Goals (Direct API - typically used by the replica in the background)

- `GET /api/goals/` - Get all goals
- `POST /api/goals/` - Create a new goal
- `GET /api/goals/<goal_id>` - Get goal details
- `PUT /api/goals/<goal_id>` - Update a goal
- `DELETE /api/goals/<goal_id>` - Delete a goal

### Milestones

- `GET /api/goals/<goal_id>/milestones` - Get all milestones for a goal
- `POST /api/goals/<goal_id>/milestones` - Create a new milestone
- `PUT /api/goals/<goal_id>/milestones/<milestone_id>` - Update a milestone
- `DELETE /api/goals/<goal_id>/milestones/<milestone_id>` - Delete a milestone

### Progress

- `GET /api/progress/goals/<goal_id>/updates` - Get progress updates for a goal
- `POST /api/progress/goals/<goal_id>/updates` - Create a progress update
- `DELETE /api/progress/goals/<goal_id>/updates/<update_id>` - Delete a progress update
- `GET /api/progress/summary` - Get a summary of goal progress
- `GET /api/progress/achievements` - Get user achievements (completed goals, milestones, and lessons learned)

## How It Works: AI-Driven Goal Management

Navi uses a unique approach where users interact primarily with the AI assistant, which intelligently determines what actions to take based on the conversation.

### Example Conversation Flow

1. **Creating a Goal Through Conversation**:
   ```
   User: "I'd like to create a goal to learn Spanish."
   AI: "That's a great goal! Can you tell me why learning Spanish is important to you?"
   User: "I'm planning a trip to Spain next year and want to be able to have basic conversations."
   AI: "Excellent! And when do you want to achieve this goal by?"
   User: "Ideally within 6 months, so by February next year."
   AI: "What specific milestones would help you track progress towards this goal?"
   User: "Maybe learning basic vocabulary, then grammar, then practicing conversations."
   AI: "I've created your Spanish learning goal with a target date of February 2023 and the milestones you mentioned..."
   ```

Behind the scenes, the AI formats the goal information into JSON and calls the appropriate API endpoints.

2. **Updating Progress**:
   ```
   User: "I've completed my first Spanish lesson and learned 50 new words."
   AI: "That's great progress! How far along do you feel you are with your Spanish goal, percentage-wise?"
   User: "Probably about 10%."
   AI: "I've updated your progress to 10%. Keep up the great work!"
   ```

3. **Analyzing Goals**:
   ```
   User: "I'm struggling with my Spanish goal. Any suggestions?"
   AI: "Let me analyze your goal... Based on your timeline and progress, here are some strategies that might help you stay on track..."
   ```

### UI-Driven Updates

When users make changes through the UI instead of chat:

1. **Updating a Goal via UI**:
   The user updates the goal title from "Learn Spanish" to "Learn Spanish and Portuguese" using UI controls.
   
   Behind the scenes:
   - The API updates the goal in the database
   - A system message is sent to the AI: "SYSTEM_UPDATE: User updated title from 'Learn Spanish' to 'Learn Spanish and Portuguese'"
   - AI responds: "Noted your expanded language learning goal. This is ambitious but achievable with the right strategy."

2. **Updating Progress via UI**:
   The user updates progress to 25% using a progress slider.
   
   Behind the scenes:
   - The API updates the progress in the database
   - A system message is sent to the AI: "SYSTEM_UPDATE: User updated progress for goal 'Learn Spanish and Portuguese' to 25%"
   - AI responds: "Great progress on your language learning journey!"

This dual-interaction model ensures that whether users interact through chat or traditional UI elements, the AI assistant maintains context and provides consistent, helpful responses.

## Project Structure

### Backend Structure
```
navi/
├── app/                        # Main application package
│   ├── __init__.py             # Application factory
│   ├── models.py               # Database models
│   ├── prompts.py              # AI assistant system prompts
│   ├── knowledge_base.py       # Knowledge base entries for replica training
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
├── migrations/                 # Database migration scripts
├── test_app.py                 # Application test script
├── requirements.txt            # Python dependencies
└── env.example                 # Example environment variables
```

### Frontend Structure
```
frontend/
├── public/              # Static assets
├── src/
│   ├── assets/          # Images and other assets
│   ├── components/      # Reusable UI components
│   │   ├── chat/        # Chat interface components
│   │   ├── goals/       # Goal visualization components
│   │   └── ui/          # Basic UI components
│   ├── context/         # React Context providers
│   ├── pages/           # Main page components
│   ├── services/        # API and service functions
│   ├── styles/          # Global styles
│   ├── App.tsx          # Main app component
│   └── main.tsx         # Entry point
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
├── tailwind.config.js   # Tailwind CSS configuration
└── vite.config.ts       # Vite configuration
```


## Acknowledgments

- [Sensay AI](https://sensay.io) for providing the AI technology
- Built for the [Sensay Hackathon](https://dorahacks.io/hackathon/sensay-hackathon/detail) 