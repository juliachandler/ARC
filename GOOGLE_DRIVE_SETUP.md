# Google Drive Integration Setup Guide

Your Academic Reference Catalogue (ARC) can now automatically save uploaded PDFs to Google Drive! Follow these steps to set it up.

## Prerequisites

- A Google account
- Access to [Google Cloud Console](https://console.cloud.google.com/)

## Step-by-Step Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** at the top
3. Click **"New Project"**
4. Name it **"ARC Reference Manager"**
5. Click **"Create"**

### 2. Enable Google Drive API

1. In your new project, go to **"APIs & Services"** → **"Library"**
2. Search for **"Google Drive API"**
3. Click on it and press **"Enable"**

### 3. Create OAuth 2.0 Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. If prompted, configure the OAuth consent screen:
   - Choose **"External"**
   - Fill in required fields:
     - App name: **ARC Reference Manager**
     - User support email: Your email
     - Developer contact: Your email
   - Click **"Save and Continue"** through all steps
   - Add yourself as a test user

4. Back to Create OAuth client ID:
   - Application type: **"Web application"**
   - Name: **ARC Web Client**
   - Authorized JavaScript origins:
     - Add: `https://yourusername.github.io`
     - Add: `http://localhost` (for local testing)
   - Authorized redirect URIs:
     - Add: `https://yourusername.github.io/repository-name`
     - Add: `http://localhost` (for local testing)
   - Click **"Create"**

5. **Copy your Client ID** - you'll need this!

### 4. Create API Key

1. Still in **"Credentials"**, click **"Create Credentials"** → **"API Key"**
2. **Copy your API Key** - you'll need this too!
3. (Optional) Click **"Restrict Key"** and limit to Google Drive API for security

### 5. Update Your Code

Open `reference-manager.jsx` and find these lines (around line 25):

```javascript
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID_HERE';
const GOOGLE_API_KEY = 'YOUR_GOOGLE_API_KEY_HERE';
```

Replace them with your actual credentials:

```javascript
const GOOGLE_CLIENT_ID = '123456789-abc123xyz.apps.googleusercontent.com';
const GOOGLE_API_KEY = 'AIzaSyAbc123XYZ-YourActualAPIKey';
```

### 6. Deploy to GitHub Pages

1. Commit and push your updated `reference-manager.jsx` to GitHub
2. Wait a few minutes for GitHub Pages to update
3. Visit your site

### 7. First-Time Connection

1. Open your ARC app
2. Enter your password
3. Click **"Connect Google Drive"** in the top right
4. Sign in with your Google account
5. Grant permissions to access Google Drive
6. You're all set! 🎉

## How It Works

Once connected:

1. **Upload a PDF** → Automatically saved to Google Drive in a folder called **"ARC References"**
2. **View PDFs** → Click "View PDF in Google Drive" button on any reference
3. **Access Anywhere** → Your PDFs are in the cloud and accessible from any device

## Features

✅ **Automatic Upload** - PDFs save to Drive when you upload them
✅ **Organized Storage** - All PDFs in one "ARC References" folder
✅ **Direct Links** - Click to open PDFs directly from references
✅ **Cloud Backup** - Never lose your research papers
✅ **Cross-Device** - Access from any computer or phone

## Privacy & Security

- **Your data stays private** - Only you can access your Drive files
- **OAuth 2.0** - Secure Google authentication
- **Limited Scope** - App only has permission to files it creates
- **No password storage** - Uses Google's secure token system

## Troubleshooting

### "Failed to connect to Google Drive"

- Check that you've enabled Google Drive API
- Verify your Client ID and API Key are correct
- Make sure your GitHub Pages URL is in authorized origins

### "Upload failed"

- Ensure you've granted Drive permissions
- Check your Google Drive storage quota
- Try disconnecting and reconnecting

### "Origin not allowed"

- Add your exact GitHub Pages URL to authorized JavaScript origins
- URLs must match exactly (with https://)
- Wait a few minutes after adding origins for changes to take effect

## Security Best Practices

1. **Keep credentials in code** - For a static site like this, it's okay. The credentials are public but restricted to your authorized domains.

2. **Restrict API Key** - In Google Cloud Console, restrict your API key to:
   - HTTP referrers (websites): `https://yourusername.github.io/*`
   - APIs: Google Drive API only

3. **Review permissions** - Periodically check which apps have access to your Drive at [myaccount.google.com/permissions](https://myaccount.google.com/permissions)

## Local Testing

To test locally before deploying:

1. Add `http://localhost` to authorized origins
2. Open `index.html` in your browser (you may need a local server)
3. Connect and test uploading

## Need Help?

Common issues:
- **403 Error**: Check API is enabled and credentials are correct
- **Redirect URI mismatch**: Ensure GitHub Pages URL matches authorized redirect URI exactly
- **Not a test user**: Add yourself in OAuth consent screen → Test users

---

Once set up, you'll have seamless integration between your reference manager and Google Drive! 🚀