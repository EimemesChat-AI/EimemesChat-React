# Troubleshooting Guide

Solutions for common issues and problems in EimemesChat AI.

---

## 📋 Table of Contents

- [Setup Issues](#setup-issues)
- [Authentication Problems](#authentication-problems)
- [Chat & API Issues](#chat--api-issues)
- [Firebase Issues](#firebase-issues)
- [File Upload Issues](#file-upload-issues)
- [Deployment Issues](#deployment-issues)
- [Performance Issues](#performance-issues)
- [Getting Help](#getting-help)

---

## Setup Issues

### Issue: `npm install` fails

**Error Message:**
```
npm ERR! peer dep missing: ...
npm ERR! Could not resolve dependency
```

**Solutions:**

1. **Clear npm cache**
   ```bash
   npm cache clean --force
   rm -rf node_modules
   rm package-lock.json
   npm install
   ```

2. **Use Node 18+**
   ```bash
   node --version  # Should be v18.0.0 or higher
   # If not, update from https://nodejs.org
   ```

3. **Use npm 9+**
   ```bash
   npm --version   # Should be 9.0.0 or higher
   npm install -g npm@latest
   ```

---

### Issue: `.env` variables not being recognized

**Error Message:**
```
VITE_FIREBASE_API_KEY is undefined
```

**Solutions:**

1. **Check filename**: Must be `.env.local` (not `.env` or `.env.development`)
   ```bash
   ls -la | grep env
   # Should show: .env.local (if not, rename or create it)
   ```

2. **Check file location**: Must be in project root
   ```bash
   pwd
   # Should be: /path/to/EimemesChat-React
   ls .env.local  # Should find the file
   ```

3. **Restart dev server** after adding `.env.local`
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev  # Restart
   ```

4. **Verify variable names**: All variables must start with `VITE_`
   ```env
   ✅ VITE_FIREBASE_API_KEY=value
   ❌ FIREBASE_API_KEY=value  (missing VITE_ prefix)
   ```

---

## Authentication Problems

### Issue: "Sign in with Google" button not working

**Error Message:**
```
Firebase: Error (auth/invalid-credential)
```

**Solutions:**

1. **Check Firebase configuration**
   ```bash
   # Verify .env.local has all Firebase variables
   echo $VITE_FIREBASE_API_KEY
   echo $VITE_FIREBASE_AUTH_DOMAIN
   echo $VITE_FIREBASE_PROJECT_ID
   # All should print values, not empty
   ```

2. **Check Firebase console**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Select your project
   - Authentication → Sign-in method → Google
   - Verify it's enabled (should show "Enabled" status)

3. **Verify OAuth redirect URI**
   - In Firebase console: Authentication → Settings → Authorized domains
   - Add `localhost:5173` for local development
   - Add `eimemes-chat-ai.vercel.app` for production

4. **Check browser console**
   - Open DevTools (F12)
   - Look for CORS errors or Firebase initialization errors
   - Share error details in [GitHub Issues](https://github.com/michaelkilong/EimemesChat-React/issues)

---

### Issue: "User not authenticated" after reload

**Problem:**
Auth token lost after page refresh.

**Solutions:**

1. **Check localStorage**
   - Open DevTools → Storage → Local Storage
   - Look for Firebase keys (should exist)
   - If empty, Firebase SDK might not be initializing

2. **Check Firebase initialization**
   - Ensure all Firebase env vars are correct
   - Restart dev server: `npm run dev`

3. **Check token expiration**
   - Firebase tokens last 1 hour
   - SDK should auto-refresh
   - If not, try signing out and back in

---

## Chat & API Issues

### Issue: Chat responses not streaming

**Problem:**
Messages take forever or don't appear.

**Solutions:**

1. **Check browser console for errors** (F12)
   - Look for network errors (red)
   - Check for JavaScript console errors
   - Share screenshot in GitHub Issues

2. **Verify API keys**
   ```bash
   # Check Vercel environment variables
   # 1. Go to Vercel dashboard
   # 2. Select project: EimemesChat-React
   # 3. Settings → Environment Variables
   # 4. Verify all keys are present:
   #    - GROQ_API_KEY
   #    - GEMINI_API_KEY
   #    - FIREBASE_PROJECT_ID
   #    - FIREBASE_CLIENT_EMAIL
   #    - FIREBASE_PRIVATE_KEY
   ```

3. **Check rate limits**
   ```
   If error message mentions "429" or "rate limit":
   - Wait a few minutes before trying again
   - Check how many messages you've sent today
   - Daily limit is 100 messages per user
   ```

4. **Check AI service status**
   - [Groq Status](https://status.groq.com)
   - [Google Cloud Status](https://status.cloud.google.com)
   - If services are down, try again later

---

### Issue: "Message exceeds maximum length" error

**Problem:**
Can't send long messages.

**Solutions:**

1. **Shorten your message**
   - Maximum message length is 5000 characters
   - Current message: Count your characters (Ctrl+Shift+C in most editors)

2. **Split into multiple messages**
   - Send complex requests as 2-3 separate messages
   - The AI remembers conversation history

3. **Use file attachments instead**
   - Upload documents with detailed content
   - Reduces need for long text messages

---

### Issue: File attachment won't upload

**Error Message:**
```
File too large or unsupported format
```

**Solutions:**

1. **Check file size** (max 25MB)
   ```bash
   ls -lh your_file
   # Check the size column
   # If > 25MB, try to compress
   ```

2. **Check file type** (supported: PDF, Word, images, TXT)
   ```
   ✅ Supported: .pdf, .docx, .doc, .png, .jpg, .jpeg, .txt
   ❌ Not supported: .exe, .zip, .html, .json
   ```

3. **Try different file**
   - If one file fails, try another
   - Test with a small PDF or image first

---

## Firebase Issues

### Issue: Firestore permission denied error

**Error Message:**
```
Missing or insufficient permissions. Missing read permission on /conversations/...
```

**Solutions:**

1. **Check Firestore rules**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Firestore Database → Rules tab
   - Verify rules allow user read/write access
   - Make sure authentication is working first

2. **Check user is authenticated**
   - Open DevTools → Console
   - Run: `firebase.auth().currentUser`
   - Should show your user object
   - If `null`, authentication failed

3. **Rebuild rules**
   ```
   Typical Firestore rules should include:
   
   match /conversations/{conversationId} {
     allow read, write: if request.auth.uid == resource.data.userId;
   }
   ```

---

### Issue: Conversations not loading

**Problem:**
Previous chats don't appear in sidebar.

**Solutions:**

1. **Check Firestore connection**
   - Open DevTools → Network tab
   - Look for Firestore calls (should be there)
   - Check for errors (red requests)

2. **Check user UID consistency**
   - DevTools Console: `firebase.auth().currentUser.uid`
   - Check Firestore: Conversations should have matching `userId`

3. **Force refresh**
   ```bash
   # Try hard refresh
   Ctrl+Shift+R (Windows/Linux)
   Cmd+Shift+R (Mac)
   # Or clear browser cache and reload
   ```

---

## File Upload Issues

### Issue: PDF/Image won't process

**Error Message:**
```
Failed to process file
```

**Solutions:**

1. **Check file integrity**
   - Try opening the file in its native application
   - If it won't open, file is corrupted
   - Try a different file

2. **Check file size again**
   - Max 25MB, recommendation <5MB
   - Large files may fail processing

3. **Compress the file**
   ```bash
   # For images (using ImageMagick):
   convert input.jpg -quality 75 output.jpg
   
   # For PDFs:
   gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 \
     -dPDFSETTINGS=/ebook -o compressed.pdf original.pdf
   ```

---

## Deployment Issues

### Issue: Deployment to Vercel failed

**Error Message:**
```
Build failed: npm run build exited with code 1
```

**Solutions:**

1. **Check TypeScript errors**
   ```bash
   # Run locally first
   npm run build
   # Look for TypeScript compilation errors
   # Fix them before pushing to GitHub
   ```

2. **Check for console errors**
   ```bash
   npm run build
   # Look for "error TS..." messages
   # Fix TypeScript errors
   ```

3. **Check .gitignore**
   ```bash
   # Make sure unnecessary files aren't committed
   cat .gitignore
   # Should include: node_modules, .env.local, dist, etc.
   ```

4. **Check environment variables on Vercel**
   - Vercel Dashboard → Project → Settings → Environment Variables
   - All required variables should be there:
     - GROQ_API_KEY
     - GEMINI_API_KEY
     - FIREBASE_PROJECT_ID
     - FIREBASE_CLIENT_EMAIL
     - FIREBASE_PRIVATE_KEY

5. **Review build logs**
   - Vercel Dashboard → Deployments → Click failing deployment
   - Expand "Build Logs" at bottom
   - Look for specific error messages

---

### Issue: "Cannot find module" error on Vercel

**Error Message:**
```
Cannot find module '@firebase/app' or its corresponding type declarations
```

**Solutions:**

1. **Verify dependencies are in package.json**
   ```bash
   cat package.json | grep -A 20 dependencies
   # Should show all required packages
   ```

2. **Delete package-lock.json and reinstall**
   ```bash
   rm package-lock.json
   npm install
   git add package-lock.json
   git commit -m "Update package-lock"
   git push origin main
   ```

3. **Force Vercel rebuild**
   - Vercel Dashboard → Deployments
   - Click "..." next to latest deployment
   - Select "Redeploy"

---

## Performance Issues

### Issue: App is slow to load

**Solutions:**

1. **Check network tab**
   - DevTools → Network tab
   - Look for large files (>100KB)
   - Check if requests are taking too long

2. **Check for bundle size**
   ```bash
   npm run build
   # Look at output showing file sizes
   # CSS and JS files should be <100KB each
   ```

3. **Clear browser cache**
   ```
   Chrome/Edge: Ctrl+Shift+Delete
   Firefox: Ctrl+Shift+Delete
   Safari: Develop → Empty Web Storage
   ```

4. **Check Internet speed**
   - Use [speedtest.net](https://speedtest.net)
   - If slow, app performance will suffer

---

### Issue: Chat responses are slow

**Solutions:**

1. **Check Groq/Gemini status**
   - Sometimes AI services are slower
   - Check their status pages

2. **Check network latency**
   - DevTools → Network tab
   - Look at request timing
   - If TTFB (Time To First Byte) is high, server is slow

3. **Check if function is cold-starting**
   - First request after long inactivity is slower
   - Subsequent requests are faster
   - This is normal for serverless functions

---

## Getting Help

### Debug Information to Collect

Before reporting an issue, gather:

1. **Browser & Version**
   ```bash
   # In DevTools console:
   navigator.userAgent
   ```

2. **Error message & screenshot**
   - Copy exact error text
   - Screenshot of error

3. **Steps to reproduce**
   - Exact sequence of actions
   - Include wait times

4. **Network errors** (if applicable)
   - DevTools ��� Network tab
   - Screenshot of failed requests

5. **Console errors**
   - DevTools → Console tab
   - Copy error messages

### Reporting Issues

1. **Check existing issues**
   - [GitHub Issues](https://github.com/michaelkilong/EimemesChat-React/issues)
   - Search for similar problems

2. **Create detailed issue**
   - Use issue template
   - Include all debug info from above
   - Be specific and concise

### Contact

- **GitHub**: [@michaelkilong](https://github.com/michaelkilong)
- **Issues**: [EimemesChat-React Issues](https://github.com/michaelkilong/EimemesChat-React/issues)
- **App**: [eimemes-chat-ai.vercel.app](https://eimemes-chat-ai.vercel.app)

---

## Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `INVALID_MESSAGE` | Message too long or invalid | Check message length (max 5000 chars) |
| `RATE_LIMITED` | Too many requests | Wait and try again later |
| `UNAUTHORIZED` | Auth token invalid/expired | Sign out and sign back in |
| `FILE_TOO_LARGE` | File exceeds 25MB | Compress file or use smaller one |
| `UNSUPPORTED_FILE_TYPE` | Wrong file format | Use PDF, images, or text files |
| `QUOTA_EXCEEDED` | Daily message limit reached | Reset at midnight UTC |
| `AI_ERROR` | Groq/Gemini service error | Try again in 30 seconds |
| `DATABASE_ERROR` | Firestore error | Check internet and try again |

---

**Still stuck?** Create an [issue](https://github.com/michaelkilong/EimemesChat-React/issues) with details above and we'll help!
