# 🚨 FIX: Supabase OAuth Redirect Issue

## Problem
After Google login, you're being redirected to `birthdaygen.com/#` instead of `/auth/callback`, which causes the "Unauthorized" error.

## Root Cause
The redirect URLs are not properly configured in your Supabase dashboard. When Supabase doesn't find a matching redirect URL, it defaults to `/#`.

---

## ✅ SOLUTION: Update Supabase Dashboard

### Step 1: Go to Supabase Dashboard

1. Open: https://app.supabase.com/project/pezchazchhnmygpdgzma
2. Navigate to: **Authentication** → **URL Configuration**

### Step 2: Add Redirect URLs

In the **"Redirect URLs"** section, add BOTH:

```
http://localhost:3000/auth/callback
https://birthdaygen.com/auth/callback
```

**Important:**
- One URL per line
- NO trailing slashes
- Include both localhost (for development) and production domain

### Step 3: Set Site URL

In the **"Site URL"** field, set:

**For Development:**
```
http://localhost:3000
```

**For Production (when deploying):**
```
https://birthdaygen.com
```

### Step 4: Save Changes

Click **"Save"** at the bottom of the page.

---

## Additional Check: Google OAuth Client

Also verify in **Google Cloud Console**:

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click on your OAuth 2.0 Client ID
3. Under **"Authorized redirect URIs"**, ensure you have:
   ```
   http://localhost:3000/auth/callback
   https://birthdaygen.com/auth/callback
   ```
4. Click **"Save"**

---

## Testing After Fix

1. **Clear your browser cookies** for localhost:3000 and birthdaygen.com
2. Go to `/auth` page
3. Click "Continue with Google"
4. After Google approval, you should be redirected to:
   - `http://localhost:3000/auth/callback?code=...&next=/contacts`
5. Then automatically redirected to `/contacts`

---

## Debug Commands

If still having issues, check the browser console and look for:

```javascript
[Auth Callback] Exchange error: ...
[Auth Callback] Session exchanged successfully. User: ...
[Auth Callback] Redirecting to: ...
```

Also check the Network tab for:
- The `/auth/callback` request
- Cookies being set (`sb-pezchazchhnmygpdgzma-auth-token`)

---

## Current Configuration Summary

**Supabase Project:** `pezchazchhnmygpdgzma`

**Required Redirect URLs in Supabase:**
- `http://localhost:3000/auth/callback` ✓
- `https://birthdaygen.com/auth/callback` ✓

**Required Redirect URLs in Google Cloud:**
- `http://localhost:3000/auth/callback` ✓ (for Supabase OAuth)
- `https://birthdaygen.com/auth/callback` ✓ (for Supabase OAuth)
- `http://localhost:3000/api/import/callback/google` ✓ (for Contacts import)
- `https://birthdaygen.com/api/import/callback/google` ✓ (for Contacts import)

**Note:** These are TWO different OAuth flows:
1. Supabase OAuth (for login) → `/auth/callback`
2. Google Contacts OAuth (for import) → `/api/import/callback/google`

