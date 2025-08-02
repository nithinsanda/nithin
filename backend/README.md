# Backend - Node.js, Express, MongoDB

## Setup

1. Copy `.env.example` to `.env` and fill in your MongoDB URI and JWT secret.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server (dev mode):
   ```bash
   npm run dev
   ```
   Or for production:
   ```bash
   npm start
   ```

## Endpoints

- `POST /api/auth/login` — Login with `{ email, password }` (returns JWT if successful)

## User Model
- `email`: String, required, unique
- `password`: String, required (hashed)

---

You can add registration and other endpoints as needed.
