# Getting Your GitHub Token for Free AI Access

Since you have GitHub Copilot, you can use GitHub Models for FREE! 🎉

## Quick Setup (Choose ONE method)

### Method 1: Using GitHub CLI (Easiest)
```bash
# Install GitHub CLI if you don't have it
brew install gh

# Login to GitHub
gh auth login

# Get your token
gh auth token
```

Copy the token and add it to your `.env` file.

### Method 2: Create Token on GitHub Website
1. Go to https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name: "AI Resume Builder"
4. **Don't select any scopes** (leave all unchecked)
5. Click "Generate token"
6. Copy the token (starts with `ghp_...`)

## Add to Your Project

```bash
cd /Users/jijo125s/Projects/CvBuilder/backend
cp .env.example .env
```

Edit `.env` file:
```
GITHUB_TOKEN=ghp_your_token_here
PORT=5000
```

## What You Get with GitHub Models

✅ **Free tier includes:**
- GPT-4o-mini (fast, smart)
- GPT-4o (most capable)
- Llama models
- Phi models
- And more!

✅ **Rate limits are generous** for personal use

## Start the App

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

Open http://localhost:3000 and start building! 🚀
