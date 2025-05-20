# Strategist - Goal Setting & Strategic Planning App

Strategist is a minimalistic app that helps users set meaningful goals, create strategic plans, and track their progress. The app uses Sensay AI technology to provide personalized guidance and assistance throughout the goal-setting and planning process.

## Key Features

- **Goal Setting**: Define clear, meaningful goals with descriptions, timelines, and importance.
- **Hierarchical Goals**: Create nested goals and subgoals for better organization.
- **Milestones**: Break goals into achievable milestones with their own deadlines.
- **Progress Tracking**: Track progress on goals and visualize your journey.
- **Reflections**: Capture thoughts on the importance of goals, potential obstacles, and strategies.
- **AI Assistant**: Chat with an AI assistant trained to help with strategic planning.
- **Goal Analysis**: Get AI-powered insights and suggestions for your goals.

## Technology Stack

- **Backend**: Python Flask
- **Database**: SQLAlchemy (with SQLite for development)
- **AI Integration**: Sensay API for AI replica creation and interaction
- **Authentication**: JWT-based auth system

## Setup Instructions

### Prerequisites

- Python 3.8 or higher
- Sensay API key (from [Sensay API](https://sensay.io))

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/strategist.git
   cd strategist
   ```

2. Create a virtual environment and activate it:
   ```
   python -m venv venv
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
   SENSAY_USER_ID_PREFIX=strategist_
   SENSAY_REPLICA_SLUG=strategist_planning_assistant
   ```

5. Initialize the database:
   ```
   python app.py create_db
   ```

### Running the Application

1. Start the Flask development server:
   ```
   flask run
   ```

2. The API will be available at `http://localhost:5000/api/`.

3. To test the application functionality, run the test script:
   ```
   python test_app.py
   ```

## API Documentation

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Log in an existing user
- `GET /api/auth/profile` - Get the current user's profile
- `PUT /api/auth/profile` - Update the current user's profile

### Goals

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

### Chat

- `GET /api/chat/history` - Get chat history
- `POST /api/chat/send` - Send a message to the AI replica
- `POST /api/chat/analyze-goal/<goal_id>` - Get AI analysis of a goal

## Acknowledgments

- [Sensay AI](https://sensay.io) for providing the AI technology
- Built for the [Sensay Hackathon](https://dorahacks.io/hackathon/sensay-hackathon/detail) 