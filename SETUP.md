# ATS Resume Writer - Setup Instructions

## Environment Variables Required

This project requires the following environment variables:

### Required for AI Features
- `OPENAI_API_KEY` - Your OpenAI API key (get from https://platform.openai.com/api-keys)

### Required for Database
- `DATABASE_URL` - PostgreSQL connection string

### Optional
- `PORT` - Server port (defaults to 5000)
- `NODE_ENV` - Environment (development or production)

## Setup Instructions for Replit

1. **Set Environment Variables in Replit Secrets:**
   - Click on the "Secrets" tab in the left sidebar (🔒 icon)
   - Add the following secrets:
     - `OPENAI_API_KEY` = your OpenAI API key
     - `DATABASE_URL` = your PostgreSQL connection string (from Neon, Supabase, etc.)

2. **Run the project:**
   ```bash
   npm run dev
   ```

## Setup Instructions for Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create a `.env` file in the root directory:**
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   DATABASE_URL=postgresql://user:password@localhost:5432/database_name
   PORT=5000
   NODE_ENV=development
   ```

3. **Run the project:**
   ```bash
   npm run dev
   ```

## Getting an OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Sign up or log in to your OpenAI account
3. Click "Create new secret key"
4. Copy the key and add it to your environment variables

## Getting a Database URL

### Option 1: Neon (Recommended for Serverless)
1. Go to https://neon.tech
2. Create a free account and a new project
3. Copy the connection string
4. Use it as your `DATABASE_URL`

### Option 2: Supabase
1. Go to https://supabase.com
2. Create a free account and a new project
3. Go to Settings > Database
4. Copy the connection string
5. Use it as your `DATABASE_URL`

### Option 3: Local PostgreSQL
1. Install PostgreSQL on your machine
2. Create a new database
3. Use connection string: `postgresql://username:password@localhost:5432/database_name`

## Troubleshooting

### "OPENAI_API_KEY not found" warning
- Make sure you've set the `OPENAI_API_KEY` environment variable
- On Replit: Use the Secrets tab
- Locally: Add it to your `.env` file

### "DATABASE_URL not found" error
- Make sure you've set the `DATABASE_URL` environment variable
- On Replit: The database is automatically provisioned
- Locally: Set up a PostgreSQL database and add the connection string

### Port already in use
- Change the `PORT` environment variable to a different port (e.g., 5001)
- Or stop any other application using port 5000

## Starting the Server

Once environment variables are set:

```bash
npm run dev
```

The server will start on http://localhost:5000 (or the port specified in `PORT`)
