# Google OAuth Setup Guide for NotePro

This guide will walk you through setting up Google OAuth authentication for your NotePro application.

## Prerequisites

- A Google account
- Access to [Google Cloud Console](https://console.cloud.google.com/)
- Your NotePro application running locally

## Step-by-Step Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" dropdown and then "New Project"
3. Enter your project name (e.g., "NotePro Auth")
4. Click "Create"

### 2. Enable Google+ API

1. In your Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click on it and then click "Enable"

**Note**: While Google+ is deprecated, the API is still used for basic profile information in OAuth flows.

### 3. Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" for user type (unless you have a Google Workspace account)
3. Fill in the required information:
   - **App name**: NotePro
   - **User support email**: Your email
   - **Developer contact information**: Your email
4. Click "Save and Continue"
5. For scopes, you can skip this step for now
6. Add test users if needed (your own email for testing)
7. Click "Save and Continue"

### 4. Create OAuth Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Choose "Web application"
4. Set the name: "NotePro Web Client"
5. Add **Authorized JavaScript origins**:
   - `http://localhost:3000` (for development)
   - Your production domain (e.g., `https://yourapp.com`)
6. Add **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - `https://yourapp.com/api/auth/callback/google` (for production)
7. Click "Create"

### 5. Save Your Credentials

After creating the OAuth client, you'll see a popup with:

- **Client ID**: Copy this value
- **Client Secret**: Copy this value

**Important**: Keep these credentials secure and never commit them to version control.

### 6. Update Environment Variables

Add the following to your `.env.local` file:

```bash
# Google OAuth Configuration
AUTH_GOOGLE_ID="your-google-client-id-here"
AUTH_GOOGLE_SECRET="your-google-client-secret-here"
```

### 7. Test the Integration

1. Start your development server:

   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/auth/signin`

3. Click the "Google" button

4. You should be redirected to Google's OAuth consent screen

5. After authorizing, you should be redirected back to your application

## Troubleshooting

### Common Issues

1. **"Error 400: redirect_uri_mismatch"**

   - Make sure your redirect URI in Google Console exactly matches `http://localhost:3000/api/auth/callback/google`
   - Ensure there are no trailing slashes or extra characters

2. **"Error 403: access_blocked"**

   - Your OAuth consent screen might not be properly configured
   - Make sure you've added your email as a test user
   - Check if your app is in "Testing" mode and needs to be published

3. **"Invalid client configuration"**

   - Double-check your `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` in `.env.local`
   - Make sure there are no extra spaces or quotes in the environment variables

4. **"Cannot read properties of undefined"**
   - Ensure you've restarted your development server after adding environment variables
   - Verify that your `.env.local` file is in the root directory

### Production Deployment

When deploying to production:

1. Update your OAuth client's authorized domains to include your production domain
2. Add your production callback URL: `https://yourdomain.com/api/auth/callback/google`
3. Set the production environment variables on your hosting platform
4. Consider publishing your OAuth consent screen for public use

## Security Best Practices

1. **Never expose credentials**: Keep your `AUTH_GOOGLE_SECRET` secure
2. **Use HTTPS in production**: Google requires HTTPS for production OAuth flows
3. **Regularly rotate secrets**: Consider rotating your OAuth credentials periodically
4. **Monitor usage**: Keep an eye on your Google Cloud Console for unusual activity

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [NextAuth.js Google Provider Documentation](https://next-auth.js.org/providers/google)
- [Google Cloud Console](https://console.cloud.google.com/)

---

**Need help?** Check the main README.md file or create an issue in the repository.
