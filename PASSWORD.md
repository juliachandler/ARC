# Password Configuration

Your Academic Reference Catalogue (ARC) is protected with a simple password.

## Current Password

The default password is: **`ARC2024`**

## Changing Your Password

To change the password:

1. Open the `reference-manager.jsx` file
2. Find this line (around line 20):
   ```javascript
   const APP_PASSWORD = 'ARC2024';
   ```
3. Change `'ARC2024'` to your desired password:
   ```javascript
   const APP_PASSWORD = 'YourNewPassword123';
   ```
4. Save the file and re-deploy to GitHub Pages

## Security Notes

⚠️ **Important Security Information:**

- This is **basic password protection** - the password is visible in the source code if someone inspects your page
- This protects against casual visitors but not determined attackers
- **However**, even if someone bypasses the password, they will only see an empty app
- Your actual reference data and PDFs are stored **locally in your browser only**
- No one can access your research data except on your own computer

## Session Persistence

- Once you enter the password, it stays active for your current browser session
- You won't need to re-enter it unless you:
  - Close all browser tabs/windows
  - Clear your browser cache
  - Use a different browser
  - Use incognito/private mode

## Recommended Password Practices

- Use a memorable but not obvious password
- Don't use personal information
- Consider using a passphrase (e.g., "CoffeeResearch2024")
- Change it periodically if desired

## Privacy Reminder

Your ARC app provides privacy in two ways:

1. **Password protection** - Keeps casual visitors out of the interface
2. **Local data storage** - Your references, notes, and PDFs never leave your computer

This means your research is always private, regardless of who might access the empty interface.