# Deployment Guide - SwiftCheckin Pre-Checkin Demo

## Step 1: Push to GitHub

### Option A: Using GitHub Desktop (Easiest - No Command Line Needed)

1. **Download GitHub Desktop** (if you don't have it):
   - Go to https://desktop.github.com/
   - Download and install it
   - Sign in with your GitHub account

2. **Add the Repository**:
   - Open GitHub Desktop
   - Click "File" → "Add Local Repository"
   - **Important**: Navigate to: `C:\Users\ARA682\OneDrive - Maersk Group\Desktop\SwiftCheckin\precheckin-demo`
   - (This is the folder WITH the package.json file)
   - Click "Add Repository"

3. **Initialize Git** (if needed):
   - If it says "This directory does not appear to be a Git repository", click "Create a Repository"
   - Name: `precheckin-demo`
   - Leave the path as is
   - Click "Create Repository"

4. **Commit Your Files**:
   - You'll see all your files listed as "Changes"
   - At the bottom, type a commit message like: "Initial commit - Pre-checkin demo app"
   - Click "Commit to main"

5. **Publish to GitHub**:
   - Click "Publish repository" button at the top
   - Repository name: `SwiftCheckin` (or leave as is)
   - Make sure "Keep this code private" is unchecked (or checked if you want it private)
   - Click "Publish Repository"
   - It will push to: `https://github.com/atulraj87/SwiftCheckin.git`

### Option B: Using Command Line (If Git is Installed)

1. **Open Command Prompt or PowerShell** in the project folder:
   ```
   cd "C:\Users\ARA682\OneDrive - Maersk Group\Desktop\SwiftCheckin\precheckin-demo"
   ```

2. **Initialize Git** (if not already done):
   ```
   git init
   ```

3. **Add the remote repository**:
   ```
   git remote add origin https://github.com/atulraj87/SwiftCheckin.git
   ```

4. **Add all files**:
   ```
   git add .
   ```

5. **Commit the files**:
   ```
   git commit -m "Initial commit - Pre-checkin demo app"
   ```

6. **Push to GitHub**:
   ```
   git branch -M main
   git push -u origin main
   ```
   (You'll need to enter your GitHub username and password/token)

---

## Step 2: Deploy on Vercel (Super Easy!)

### What is Vercel?
Vercel is a platform that automatically hosts your website and makes it live on the internet. It's free for personal projects and works perfectly with Next.js apps.

### Steps to Deploy:

1. **Go to Vercel Website**:
   - Open your browser and go to: https://vercel.com
   - Click "Sign Up" (or "Log In" if you already have an account)
   - **Easiest way**: Click "Continue with GitHub" to sign in with your GitHub account

2. **Import Your Project**:
   - After logging in, you'll see a dashboard
   - Click the big "Add New..." button → "Project"
   - You'll see a list of your GitHub repositories
   - Find "SwiftCheckin" (or "atulraj87/SwiftCheckin") and click "Import"

3. **Configure Project** (Vercel will auto-detect everything):
   - **Framework Preset**: Should auto-detect as "Next.js" ✅
   - **Root Directory**: 
     - If you pushed just the `precheckin-demo` folder contents → Leave as `.` (default)
     - If you pushed the entire `SwiftCheckin` folder → Change to `precheckin-demo`
   - **Build Command**: Leave as default (`npm run build`)
   - **Output Directory**: Leave as default (`.next`)
   - **Install Command**: Leave as default (`npm install`)

4. **Deploy!**:
   - Click the big "Deploy" button
   - Wait 2-3 minutes while Vercel builds your app
   - You'll see a progress bar

5. **Your App is Live!**:
   - Once deployment is complete, you'll see a success message
   - Click on your project name
   - You'll see a URL like: `https://swiftcheckin-xyz123.vercel.app`
   - **This is your live website!** Share this URL with anyone

### What Happens Next?

- **Every time you push to GitHub**, Vercel automatically rebuilds and updates your live site
- You can add a custom domain later if you want (like `swiftcheckin.com`)
- All your changes are automatically deployed - no manual steps needed!

---

## Troubleshooting

### If Git is Not Installed:
1. Download Git from: https://git-scm.com/download/win
2. Install it (use default settings)
3. Restart your computer
4. Try the commands again

### If Vercel Can't Find Your Repo:
- Make sure you've pushed your code to GitHub first
- Make sure you're logged into Vercel with the same GitHub account

### If Build Fails on Vercel:
- Check the build logs in Vercel dashboard
- Make sure all dependencies are in `package.json`
- The app should work fine as-is since it's a standard Next.js app

---

## Quick Summary

1. ✅ Push code to GitHub (using GitHub Desktop or command line)
2. ✅ Sign up/login to Vercel with GitHub
3. ✅ Import your GitHub repository
4. ✅ Click Deploy
5. ✅ Get your live URL!

**That's it! Your app will be live on the internet in about 5 minutes!** 🚀

