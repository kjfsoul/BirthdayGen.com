# 🚀 QUICK FIX: Stop the `/#` Redirect

## The Problem
After clicking "Continue with Google", you're redirected to `birthdaygen.com/#` instead of the proper callback, causing the "Unauthorized" error.

## The Root Cause
**Supabase doesn't have the correct redirect URLs configured.** When it can't find a matching URL, it defaults to `/#`.

---

## ✅ THE FIX (5 MINUTES)

### Step 1: Open Supabase Dashboard

**Direct Link:**
```
https://app.supabase.com/project/pezchazchhnmygpdgzma/auth/url-configuration
```

Or navigate manually:
1. Go to https://app.supabase.com
2. Select project: `pezchazchhnmygpdgzma`
3. Click: **Authentication** (left sidebar)
4. Click: **URL Configuration** (tab)

---

### Step 2: Configure Site URL

Find the **"Site URL"** field and set it to:

**For Local Development:**
```
http://localhost:3000
```

**For Production (after deploying):**
```
https://birthdaygen.com
```

> 💡 **Tip:** Start with `http://localhost:3000` for testing locally

---

### Step 3: Add Redirect URLs

Scroll down to the **"Redirect URLs"** section.

Click the **"Add URL"** button and add BOTH of these URLs:

```
http://localhost:3000/auth/callback
```

```
https://birthdaygen.com/auth/callback
```

**Important Notes:**
- ✅ Add both URLs (one for local, one for production)
- ✅ NO trailing slashes
- ✅ Must be exact match including `/auth/callback` path
- ✅ Click "Add URL" for each one separately

---

### Step 4: Save Changes

Click the **"Save"** button at the bottom of the page.

---

### Step 5: Test the Fix

1. **Clear your browser cookies** for `localhost:3000`
   - Open Developer Tools (F12)
   - Go to: **Application** → **Cookies** → `http://localhost:3000`
   - Right-click → **Clear**

2. **Restart your dev server**:
   ```bash
   # In your terminal, stop pnpm dev (Ctrl+C) and restart
   pnpm dev
   ```

3. **Test the login flow**:
   - Go to: http://localhost:3000/auth
   - Click: **"Continue with Google"**
   - Approve the Google OAuth consent
   - **You should be redirected to:** `http://localhost:3000/auth/callback?code=...`
   - **Then automatically to:** `http://localhost:3000/contacts`

---

## 🎯 Expected Behavior After Fix

### Before Fix ❌
```
http://localhost:3000/auth
  → Google OAuth
  → http://localhost:3000/#  ← WRONG! This causes "Unauthorized"
```

### After Fix ✅
```
http://localhost:3000/auth
  → Google OAuth
  → http://localhost:3000/auth/callback?code=abc123...  ← Correct!
  → http://localhost:3000/contacts  ← Logged in successfully!
```

---

## 🔍 How to Verify It Worked

### 1. Check Browser Network Tab
- Open Dev Tools (F12) → **Network** tab
- Click "Continue with Google"
- After OAuth, you should see:
  - Request to: `/auth/callback?code=...`
  - Response: 302 redirect to `/contacts`

### 2. Check Cookies
- Open Dev Tools (F12) → **Application** → **Cookies**
- After login, you should see:
  - `sb-pezchazchhnmygpdgzma-auth-token` (or similar)
  - `sb-pezchazchhnmygpdgzma-auth-token-code-verifier`

### 3. Check Console Logs
- Open Dev Tools (F12) → **Console**
- After OAuth callback, you should see:
  ```
  [Auth Callback] Session exchanged successfully. User: <user-id>
  [Auth Callback] Redirecting to: http://localhost:3000/contacts
  ```

---

## 🚨 If Still Having Issues

### Issue: Still redirecting to `/#`
**Cause:** Redirect URLs not saved or typo in URL

**Fix:**
- Double-check exact URLs in Supabase dashboard
- Ensure no trailing slashes
- Click "Save" button
- Hard refresh browser (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)

### Issue: "Unauthorized" error at `/contacts`
**Cause:** Session cookie not being set

**Fix:**
- Check browser console for errors
- Verify middleware.ts is not blocking cookies
- Check `/auth/callback/route.ts` logs in terminal

### Issue: Different error message
**Solution:**
- Check terminal logs for `[Auth Callback]` messages
- Share the exact error message for specific help

---

## 📋 Summary Checklist

- [ ] Open Supabase dashboard
- [ ] Set Site URL to `http://localhost:3000`
- [ ] Add redirect URL: `http://localhost:3000/auth/callback`
- [ ] Add redirect URL: `https://birthdaygen.com/auth/callback`
- [ ] Click "Save"
- [ ] Clear browser cookies
- [ ] Restart dev server
- [ ] Test login flow
- [ ] Verify cookies are set
- [ ] Confirm redirect to `/contacts` works

---

## 🎉 Success Indicators

When everything works correctly:

✅ No redirect to `/#`
✅ Clean redirect to `/auth/callback?code=...`
✅ Automatic redirect to `/contacts`
✅ User is logged in and can access protected pages
✅ Cookies are present in browser
✅ No "Unauthorized" errors

---

**Need more help?** Check:
- `SUPABASE_REDIRECT_FIX.md` for detailed explanations
- `GOOGLE_OAUTH_SETUP.md` for Google OAuth configuration
- Run `./scripts/diagnose-oauth.sh` for configuration diagnostic
