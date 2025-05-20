# Strategist App Setup Guide

This guide provides detailed instructions for setting up and running the Strategist application.

## Prerequisites

Before you begin, ensure you have the following installed:

- Python 3.8 or higher
- pip (Python package manager)
- Git
- A Sensay API key (available from [Sensay](https://sensay.io))

## Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/strategist.git
cd strategist
```

## Step 2: Create a Virtual Environment

It's recommended to use a virtual environment to manage dependencies:

```bash
# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

## Step 3: Install Dependencies

Install the required Python packages:

```bash
pip install -r requirements.txt
```

## Step 4: Environment Configuration

1. Create a `.env` file in the root directory:

```bash
cp env.example .env
```

2. Edit the `.env` file with your specific configuration:

```
# Flask configuration
FLASK_APP=app
FLASK_ENV=development
SECRET_KEY=generate_a_secure_random_key_here

# Database configuration
DATABASE_URL=sqlite:///strategist.db

# JWT configuration
JWT_SECRET_KEY=generate_another_secure_random_key_here
JWT_ACCESS_TOKEN_EXPIRES=86400

# Sensay API configuration
SENSAY_API_KEY=your_sensay_api_key_here
SENSAY_USER_ID_PREFIX=strategist_
SENSAY_REPLICA_SLUG=strategist_planning_assistant
```

You can generate secure random keys using Python:

```bash
python -c "import secrets; print(secrets.token_hex(24))"
```

## Step 5: Initialize the Database

Create the database and tables:

```bash
flask create_db
```

## Step 6: Run the Application

Start the Flask development server:

```bash
flask run
```

The API will be available at `http://localhost:5000/api/`.

## Step 7: Test the Application

You can test the application functionality using the provided test script:

```bash
python test_app.py
```

This script will:
1. Register/log in a test user
2. Create goals and subgoals
3. Add milestones and reflections
4. Update progress
5. Interact with the AI replica
6. Generate goal analysis

## API Endpoints

Once the application is running, you can interact with it using the following endpoints:

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

See the README.md file for a complete list of available endpoints.

## Troubleshooting

### Database Issues

If you encounter database errors, you can reset the database:

```bash
flask drop_db
flask create_db
```

### Sensay API Connection Issues

If you have trouble connecting to the Sensay API:

1. Verify your API key in the `.env` file
2. Check that you have internet connectivity
3. Ensure the Sensay API service is available

### JWT Authentication Issues

If you experience JWT authentication problems:

1. Make sure your JWT_SECRET_KEY is set correctly
2. Check that the token hasn't expired (default is 24 hours)
3. Verify you're including the token in the Authorization header: `Authorization: Bearer <token>`

### Application Errors

For detailed error information, check the Flask application logs.

## Next Steps

After setting up the backend, you might want to:

1. Develop a frontend application to interact with the API
2. Set up a production deployment with a proper database (PostgreSQL, MySQL)
3. Configure HTTPS for secure API communication
4. Implement additional features like notifications or calendar integration

For more information, refer to the README.md and ARCHITECTURE.md files. 