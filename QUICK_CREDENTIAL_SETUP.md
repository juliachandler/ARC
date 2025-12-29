# Quick Credential Setup Guide

## How to Add Your Google Drive Credentials

### Step 1: Open the File
1. Find and open `reference-manager.jsx` in any text editor:
   - **Windows**: Right-click → Open with → Notepad
   - **Mac**: Right-click → Open With → TextEdit
   - **Any OS**: Use VS Code, Sublime, or any code editor

### Step 2: Find the Credentials Section
Look for these lines (around line 29-46):

```javascript
// ============================================================================
// GOOGLE DRIVE CREDENTIALS - FOLLOW THESE STEPS:
// ============================================================================

const GOOGLE_CLIENT_ID = 'PASTE_YOUR_CLIENT_ID_HERE';
const GOOGLE_API_KEY = 'PASTE_YOUR_API_KEY_HERE';
```

### Step 3: Replace the Placeholders

**BEFORE:**
```javascript
const GOOGLE_CLIENT_ID = 'PASTE_YOUR_CLIENT_ID_HERE';
const GOOGLE_API_KEY = 'PASTE_YOUR_API_KEY_HERE';
```

**AFTER** (with your actual credentials):
```javascript
const GOOGLE_CLIENT_ID = '123456789-abc123xyz.apps.googleusercontent.com';
const GOOGLE_API_KEY = 'AIzaSyAbc123XYZ-YourActualAPIKey';
```

### Step 4: Save the File
- Press `Ctrl+S` (Windows) or `Cmd+S` (Mac)
- Make sure it saves as `reference-manager.jsx` (not .txt)

### Step 5: Upload to GitHub
Now you're ready to upload all your files to GitHub!

---

## Visual Guide:

```
1. Find this:     const GOOGLE_CLIENT_ID = 'PASTE_YOUR_CLIENT_ID_HERE';
                                            ↑
2. Select this text: PASTE_YOUR_CLIENT_ID_HERE
                     (everything between the quotes)

3. Delete it and paste your actual Client ID

4. Do the same for the API Key line
```

---

## ⚠️ Common Mistakes to Avoid:

❌ **DON'T** remove the quotes
```javascript
const GOOGLE_CLIENT_ID = 123456789-abc.apps.googleusercontent.com;  // WRONG!
```

✅ **DO** keep the quotes
```javascript
const GOOGLE_CLIENT_ID = '123456789-abc.apps.googleusercontent.com';  // CORRECT!
```

❌ **DON'T** add extra spaces
```javascript
const GOOGLE_CLIENT_ID = '  123456789-abc  ';  // WRONG!
```

✅ **DO** paste directly between quotes
```javascript
const GOOGLE_CLIENT_ID = '123456789-abc';  // CORRECT!
```

---

## All Done?

Once you've edited and saved the file, you're ready to:
1. Upload all files to GitHub
2. Enable GitHub Pages
3. Test your app!

Your credentials will work only with your specific GitHub Pages URL, so they're safe to put in the public code.