# Strategist Scripts

This directory contains utility scripts for interacting with the Strategist API.

## Available Scripts

### `test_achievements.py`

A script to demonstrate and test the achievements API endpoint. This script shows how to retrieve and display a user's achievements, including completed goals, milestones, and reflections that contain lessons learned.

#### Usage

```bash
# Run with automatic login
python scripts/test_achievements.py

# Provide your own token
python scripts/test_achievements.py --token YOUR_JWT_TOKEN

# Additional options
python scripts/test_achievements.py [--limit NUMBER] [--raw] [--skip-login]
```

Parameters:
- `--token`: Your JWT authentication token (optional). If not provided, the script will automatically log in using test credentials. You can also set the `AUTH_TOKEN` environment variable.
- `--limit`: Optional. Limit the number of achievements returned.
- `--raw`: Optional. Display the raw JSON response instead of the formatted output.
- `--skip-login`: Optional. Skip automatic login (requires --token to be provided).

#### Environment Variables

- `API_URL`: Base URL for the API (defaults to 'http://localhost:5000/api')
- `AUTH_TOKEN`: Default authentication token

#### Examples

1. Get all achievements with automatic login:
   ```bash
   python scripts/test_achievements.py
   ```

2. Get all achievements with a specific token:
   ```bash
   python scripts/test_achievements.py --token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. Get the 5 most recent achievements:
   ```bash
   python scripts/test_achievements.py --limit 5
   ```

4. Get achievements as raw JSON:
   ```bash
   python scripts/test_achievements.py --raw
   ```

## Authentication

The scripts handle authentication in two ways:

1. **Automatic authentication**: By default, scripts will attempt to register/login with test credentials:
   - Username: testuser
   - Email: testuser@example.com
   - Password: testpassword

2. **Manual authentication**: You can provide your own JWT token:
   ```bash
   python scripts/test_achievements.py --token YOUR_ACCESS_TOKEN
   ```

### Getting Your Own Authentication Token

If you want to use your own token instead of the automatic login:

1. Log in to the Strategist application using the authentication endpoint:
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username": "your_username", "password": "your_password"}'
   ```

2. From the response, copy the `access_token` value.

3. Use this token with the scripts:
   ```bash
   python scripts/test_achievements.py --token YOUR_ACCESS_TOKEN
   ``` 