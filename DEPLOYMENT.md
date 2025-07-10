# 🚀 Deployment Guide

This guide will help you deploy your self-interview app with the frontend on Vercel and backend on Render.

## 📋 Prerequisites

- GitHub account
- Vercel account (free)
- Render account (free)
- Gemini API key from Google AI Studio

## 🎯 Architecture

```
Frontend (Vercel) ←→ Backend (Render) ←→ Gemini API
```

## 🔧 Step 1: Deploy Backend on Render

### 1.1 Prepare Your Repository

1. **Push your code to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

### 1.2 Deploy on Render

1. **Go to [Render.com](https://render.com)** and sign up/login
2. **Click "New +"** → **"Web Service"**
3. **Connect your GitHub repository**
4. **Configure the service**:
   - **Name**: `selfinterview-api` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

5. **Add Environment Variables**:
   - Click on "Environment" tab
   - Add: `NODE_ENV` = `production`
   - (No API key needed on server - users provide their own)

6. **Deploy**: Click "Create Web Service"

7. **Wait for deployment** and copy your service URL (e.g., `https://selfinterview-api.onrender.com`)

### 1.3 Update Frontend Configuration

Once your Render service is deployed, update the API URL:

1. **Edit `src/config/api.ts`**:
   ```typescript
   export const API_BASE_URL = isDevelopment 
     ? 'http://localhost:3001' 
     : 'https://your-render-app-name.onrender.com'; // Replace with your actual Render URL
   ```

2. **Commit and push the changes**:
   ```bash
   git add .
   git commit -m "Update API URL for production"
   git push origin main
   ```

## 🌐 Step 2: Deploy Frontend on Vercel

### 2.1 Deploy on Vercel

1. **Go to [Vercel.com](https://vercel.com)** and sign up/login
2. **Click "New Project"**
3. **Import your GitHub repository**
4. **Configure the project**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. **Add Environment Variables** (if needed for Firebase):
   - Click "Environment Variables"
   - Add any Firebase config variables if you're using them

6. **Deploy**: Click "Deploy"

### 2.2 Configure Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Click "Domains"
3. Add your custom domain

## 🔒 Step 3: Security & Environment Variables

### Environment Variables Setup

**Render (Backend)**:
- `NODE_ENV`: `production`
- (No API key needed - users provide their own keys)

**Vercel (Frontend)**:
- Any Firebase config variables if using Firebase

### Security Best Practices

1. **Never commit API keys** to your repository
2. **Use environment variables** for all sensitive data
3. **Enable CORS** properly (already configured in server.js)
4. **Use HTTPS** (automatically handled by Vercel/Render)

## 🧪 Step 4: Testing Your Deployment

### Test Backend (Render)
```bash
# Test health endpoint
curl https://your-render-app.onrender.com/api/health

# Test Gemini endpoint (replace with your API key)
curl -X POST https://your-render-app.onrender.com/api/gemini \
  -H "Content-Type: application/json" \
  -d '{"prompt":"hello","model":"gemini-2.5-pro","userApiKey":"your-gemini-api-key"}'
```

### Test Frontend (Vercel)
1. Visit your Vercel URL
2. Navigate to the interview system check
3. Enter your Gemini API key
4. Test the interview flow

## 🔄 Step 5: Updates & Maintenance

### Updating Your App

1. **Make changes locally**
2. **Test locally**: `npm run dev:full`
3. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Your update description"
   git push origin main
   ```
4. **Automatic deployment**: Both Vercel and Render will automatically redeploy

### Monitoring

- **Vercel**: Check deployment status in your dashboard
- **Render**: Monitor logs and performance in your service dashboard
- **API Health**: Use the `/api/health` endpoint to check backend status

## 🚨 Troubleshooting

### Common Issues

1. **API Key Validation Fails**:
   - Check if your Render service is running
   - Verify the API URL in `src/config/api.ts`
   - Ensure your Gemini API key is valid

2. **CORS Errors**:
   - Check that your frontend URL is allowed in the backend CORS config
   - Verify the API endpoints are correct

3. **Build Failures**:
   - Check the build logs in Vercel/Render
   - Ensure all dependencies are in `package.json`

### Debug Commands

```bash
# Check if server is running locally
curl http://localhost:3001/api/health

# Check production server
curl https://your-render-app.onrender.com/api/health

# Test API with your key
curl -X POST https://your-render-app.onrender.com/api/gemini \
  -H "Content-Type: application/json" \
  -d '{"prompt":"test","model":"gemini-2.5-pro","userApiKey":"your-gemini-api-key"}'
```

## 📊 Performance Tips

1. **Enable caching** in Vercel for static assets
2. **Use CDN** for better global performance
3. **Monitor API response times** in Render dashboard
4. **Optimize images** and assets for faster loading

## 🎉 Success!

Your app is now deployed with:
- ✅ Frontend on Vercel (fast, global CDN)
- ✅ Backend on Render (reliable, scalable)
- ✅ Secure API key handling
- ✅ Automatic deployments on code changes

Both services offer free tiers that should be sufficient for most use cases! 