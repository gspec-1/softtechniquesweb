# Railway Deployment Configuration Guide

## Frontend Configuration for Railway Backend

Your frontend has been updated to work with your Railway-deployed backend. Here's what you need to do:

### 1. Set Environment Variable

Create a `.env.local` file in your project root with your Railway URL:

```bash
# Your actual Railway deployment URL
NEXT_PUBLIC_API_BASE_URL=https://web-production-608ab4.up.railway.app
```

### 2. Find Your Railway URL

1. Go to your Railway dashboard
2. Select your chatbot backend project
3. Go to the "Deployments" tab
4. Copy the URL (it should look like: `https://your-app-name-production.up.railway.app`)

### 3. Update the Environment Variable

Replace `https://your-railway-app-url.railway.app` in your `.env.local` file with your actual Railway URL.

### 4. Deploy to Netlify

1. Push your changes to your Git repository
2. Netlify will automatically deploy the updated frontend
3. Make sure to add the environment variable in Netlify's dashboard:
   - Go to Site settings > Environment variables
   - Add `NEXT_PUBLIC_API_BASE_URL` with your Railway URL

### 5. Test the Connection

After deployment, test:
- Chat functionality
- Consultation scheduling
- All API endpoints should now point to your Railway backend

### Files Updated

- `src/config/api.ts` - New API configuration file
- `src/components/ChatInterface.tsx` - Updated to use Railway API
- `src/app/schedule/page.tsx` - Updated to use Railway API

### Local Development

For local development, you can override the environment variable:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

This allows you to test locally while keeping the production configuration pointing to Railway.
