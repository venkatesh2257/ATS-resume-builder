# Quick Start Guide - ATS Resume Writer

## ✅ Server is Running Successfully!

Your application is now running on **http://localhost:5000**

## Why the "Analyze Keywords" Button Might Not Work

The button requires two things to be active:
1. **At least 10 characters in the Job Description field** ✅ (You have this)
2. **Complete Personal Information section** with:
   - Full Name*
   - Email*
   - Phone*
   - Location*

Make sure all required (*) fields in the Personal Info tab are filled!

## Setting Up OpenAI API Key

To enable AI features (keyword extraction and resume optimization), you need to set up an OpenAI API key:

### Option 1: Using Environment Variables (Windows PowerShell)
```powershell
$env:OPENAI_API_KEY="sk-your-api-key-here"
$env:DATABASE_URL="postgresql://user:pass@localhost:5432/db"
npm run dev
```

### Option 2: Create a .env file
Create a `.env` file in the project root:
```
OPENAI_API_KEY=sk-your-api-key-here
DATABASE_URL=postgresql://user:pass@localhost:5432/db
```

### Getting an OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Sign up or log in
3. Click "Create new secret key"
4. Copy the key and use it as shown above

## Current Status

✅ Server running on http://localhost:5000  
✅ Frontend accessible  
⚠️ OpenAI API key not configured (AI features will show error messages)  
⚠️ Database not configured (not critical for basic testing)

## Testing Without API Key

You can test the app's UI without an API key. When you click "Analyze Keywords", you'll see:
- A toast notification showing the error message
- The error will explain that the API key needs to be configured

## Next Steps

1. **Fill in your resume information** in the Personal Info tab
2. **Click "Analyze Keywords"** to test
3. **Set up the OPENAI_API_KEY** to enable AI features
4. **Optional**: Set up a database for storing resumes

## Troubleshooting

**Button is disabled?**
- Check that all Personal Info fields (*) are filled
- Ensure job description has at least 10 characters

**Getting an error when clicking?**
- Check the browser console for details
- A toast notification will show the error message
- Make sure the server is running (check terminal)

## Need Help?

Check the `SETUP.md` file for detailed setup instructions and database configuration options.
