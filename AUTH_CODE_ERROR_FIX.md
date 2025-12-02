# 🚨 Auth Code Error - Diagnostic Steps

## What Just Happened

You were redirected to `/auth/auth-code-error#` which means one of these occurred:

1. **No auth code received** - OAuth callback didn't get the `code` parameter
2. **Code exchange failed** - Supabase couldn't exchange the code for a session
3. **OAuth provider error** - Google returned an error instead of auth code

---

## ✅ IMMEDIATE DIAGNOSTIC STEPS

### Step 1: Check Server Logs

Your dev server should now show detailed logs. Look for:

```
[Auth Callback] Received request: {
  url: '...',
  code: 'MISSING' or '...',  ← If MISSING, that's the problem
  error: null or '...',       ← If set, Google rejected OAuth
  errorDescription: '...',
  allParams: [...]
}
```

**If you see `code: 'MISSING'`:**
→ The redirect URL in Supabase is NOT configured correctly
→ Google is redirecting to the wrong URL

**If you see `error: 'access_denied'`:**
→ You (or Google) denied the OAuth consent
→ Try again and click "Allow"

**If you see code but exchange fails:**
→ Supabase configuration issue
→ Check project ID matches

---

### Step 2: Verify Supabase Redirect URLs

**CRITICAL:** You MUST add these EXACT URLs in Supabase Dashboard:

1. Go to: https://app.supabase.com/project/pezchazchhnmygpdgzma/auth/url-configuration

2. **Site URL** should be:
   ```
   http://localhost:3000
   ```

3. **Redirect URLs** must include (click "Add URL" for each):
   ```
   http://localhost:3000/auth/callback
   ```

   If using production:
   ```
   https://birthdaygen.com/auth/callback
   ```

4. Click **SAVE** at the bottom

---

### Step 3: Check Google Cloud Console

**For Supabase Login OAuth Client:**

1. Go to: https://console.cloud.google.com/apis/credentials
2. Find the OAuth client used by Supabase (you might have created this in Supabase dashboard)
3. **Authorized redirect URIs** must include:
   ```
   https://pezchazchhnmygpdgzma.supabase.co/auth/v1/callback
   ```

**Note:** This is DIFFERENT from your Contacts import OAuth client

---

### Step 4: Clear Cookies and Test Again

1. **Clear ALL cookies** for localhost:3000 (as we did before)
2. **Hard refresh**: Cmd+Shift+R
3. Go to `/auth` and try "Continue with Google" again
4. **Watch the terminal logs** for the `[Auth Callback]` messages
5. Check what error appears on error page (now shows details)

---

## 🔍 DEBUGGING CHECKLIST

Run through this list:

- [ ] Cookies cleared for localhost:3000
- [ ] Dev server restarted (`pnpm dev`)
- [ ] Supabase Site URL = `http://localhost:3000`
- [ ] Supabase Redirect URLs includes `http://localhost:3000/auth/callback`
- [ ] Supabase configuration saved
- [ ] Google OAuth client has Supabase callback URL
- [ ] Browser is not blocking redirects
- [ ] No browser extensions interfering (test in Incognito)

---

## 📝 What to Look For in Logs

After clicking "Continue with Google", you should see:

### **Expected Flow (Success):**
```
1. User clicks Google OAuth
2. Redirects to Google
3. User approves
4. Google redirects to: http://localhost:3000/auth/callback?code=abc123...
5. Server logs: [Auth Callback] Received request: { code: 'abc123...' }
6. Server logs: [Auth Callback] Session exchanged successfully
7. Server logs: [Auth Callback] Redirecting to: http://localhost:3000/contacts
8. User sees /contacts page, logged in ✅
```

### **What You're Seeing (Failure):**
```
1. User clicks Google OAuth
2. Redirects to Google
3. User approves
4. Google redirects to: ??? (unknown, might be wrong URL)
5. Server logs: [Auth Callback] ??? (check your terminal)
6. User sees: /auth/auth-code-error
```

---

## 🎯 Most Likely Issue

Based on the pattern, **99% chance** this is:

**Redirect URLs not configured in Supabase dashboard**

Even though you said you "did all that", please:
1. Go to Supabase dashboard again
2. Screenshot the "URL Configuration" page
3. Verify EXACTLY: `http://localhost:3000/auth/callback` is listed
4. Make sure you clicked **SAVE**

Sometimes the save doesn't work, or there's a typo.

---

## 🔧 Quick Test

Try this in your browser console after going to `/auth`:

```javascript
// This shows where Supabase will redirect
localStorage.getItem('supabase.auth.token')
```

If null or contains old project ID → cookies not cleared properly

---

## 📞 Next Steps

1. **Check your terminal output** right after the OAuth failure
2. **Copy and show me** the `[Auth Callback]` log messages
3. **Screenshot** the Supabase URL Configuration page
4. **Tell me** what error message appears on the error page (should show details now)

With those 4 pieces of info, I can pinpoint the exact issue.

---

## 💡 Alternative: Test with cURL

To verify the callback route works:

```bash
# Test if callback route is accessible
curl -I http://localhost:3000/auth/callback
```

Should return `302` redirect (not 404).

---

**The enhanced logging is now in place. Try the login flow again and share what appears in the terminal!**
