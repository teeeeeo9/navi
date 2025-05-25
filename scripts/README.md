# Strategist Scripts

This directory contains utility scripts for managing and interacting with the Strategist application.

## Available Scripts

### list_replicas.py
Lists all replicas for a Sensay user.

```bash
python scripts/list_replicas.py --user-id <sensay_user_id>
```

### list_knowledge_base.py
Lists all knowledge base entries (training data) for a Sensay replica or user.

```bash
# List knowledge base entries for a specific replica
python scripts/list_knowledge_base.py --replica-id <replica_id>

# List knowledge base entries for all replicas of a user
python scripts/list_knowledge_base.py --user-id <sensay_user_id>

# Output in JSON format (useful for further processing)
python scripts/list_knowledge_base.py --user-id <sensay_user_id> --format json
```

### delete_replica.py
Deletes a specific replica from Sensay.

```bash
python scripts/delete_replica.py --replica-id <replica_id> --user-id <sensay_user_id>
```

### cleanup.py
Performs cleanup operations on the application database and Sensay.

```bash
python scripts/cleanup.py
```

### test_achievements.py
Tests the achievements functionality of the application.

```bash
python scripts/test_achievements.py
```

### migrate_progress_types.py
Migrates progress updates to the new type system.

```bash
python scripts/migrate_progress_types.py
```

## Environment Setup

All scripts expect the following environment variables to be set:

- `SENSAY_API_KEY`: Your Sensay API key
- `SENSAY_USER_ID`: (Optional) Default Sensay user ID to use if not specified

You can set these in a `.env` file in the project root directory.

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