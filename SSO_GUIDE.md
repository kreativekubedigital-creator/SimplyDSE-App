# SimplyDSE: SSO Configuration Guide

This guide explains how to configure Single Sign-On (SSO) for the SimplyDSE platform using Google and Microsoft Azure AD.

## 1. Google OAuth Setup

### A. Google Cloud Console
1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a new project named **SimplyDSE**.
3.  Go to **APIs & Services > OAuth consent screen**.
    *   Choose **External** (unless you only want your own company to log in).
    *   Fill in the required app information.
4.  Go to **Credentials > Create Credentials > OAuth client ID**.
    *   **Application type**: Web application.
    *   **Name**: SimplyDSE Web Client.
    *   **Authorized redirect URIs**: (Get this from Supabase in the next step).

### B. Supabase Configuration
1.  Go to **Authentication > Providers > Google**.
2.  Toggle **Enable Google-Enabled**.
3.  Copy the **Callback URL** from Supabase.
4.  Paste this into the **Authorized redirect URIs** in the Google Cloud Console.
5.  Copy the **Client ID** and **Client Secret** from Google and paste them into Supabase.
6.  Click **Save**.

---

## 2. Microsoft (Azure AD) Setup

### A. Azure Portal
1.  Go to the [Azure Portal](https://portal.azure.com/).
2.  Search for **App registrations** and click **New registration**.
3.  **Name**: SimplyDSE.
4.  **Supported account types**: "Accounts in any organizational directory (Any Azure AD directory - Multitenant)".
5.  **Redirect URI**: Select **Web** and (Get this from Supabase in the next step).

### B. Supabase Configuration
1.  Go to **Authentication > Providers > Azure**.
2.  Toggle **Enable Azure-Enabled**.
3.  Copy the **Callback URL** from Supabase.
4.  Paste this into the **Redirect URI** in the Azure Portal.
5.  Go to **Certificates & secrets** in Azure and create a **New client secret**.
6.  Copy the **Application (client) ID** and the **Secret Value** (not ID) into Supabase.
7.  Click **Save**.

---

## 3. Important Notes

### Redirect URLs
Ensure that your production URL and subdomains are whitelisted in **Authentication > URL Configuration**:
*   `https://*.simplydse.online/**`
*   `https://simplydse.online/auth/callback`

### Testing
1.  Open the login modal on `simplydse.online`.
2.  Click **Sign in with Google**.
3.  You should be redirected to the Google login screen.
4.  After selecting an account, you should be redirected back to `simplydse.online/dashboard`.

### Troubleshooting
*   **Redirect Mismatch**: Double check that the URL in the Google/Azure console matches EXACTLY with what Supabase provides.
*   **Permissions**: Ensure you have requested the `email` and `profile` scopes (Supabase does this by default).
