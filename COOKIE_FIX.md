# 🚨 CRITICAL FIX: Old Supabase Cookies Blocking Auth

## The Problem

You're seeing "Auth session missing!" because your browser has **cookies from an OLD Supabase project**.

### From Your Logs:
```
Cookies: sb-pqfsbxcbsxuyfgqrxdob-auth-token-code-verifier, sb-pqfsbxcbsxuyfgqrxdob-auth-token
User: undefined Error: Auth session missing!
```

### Expected Cookies:
```
Cookies: sb-pezchazchhnmygpdgzma-auth-token-code-verifier, sb-pezchazchhnmygpdgzma-auth-token
```

**The mismatch:** `pqfsbxcbsxuyfgqrxdob` (old) vs `pezchazchhnmygpdgzma` (current)

---

## ✅ THE FIX

### Step 1: Clear Old Cookies

Run this script for interactive instructions:
```bash
./scripts/clear-cookies.sh
```

**Or manually:**

1. **Open Browser DevTools** (F12 or Cmd+Option+I)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. In left sidebar: **Cookies** → `http://localhost:3000`
4. **Delete ALL cookies** starting with `sb-pqfsbxcbsxuyfgqrxdob`
5. **Delete ALL cookies** starting with `sb-` to be safe
6. Close DevTools

### Step 2: Hard Refresh Browser

- **Mac:** Cmd+Shift+R
- **Windows/Linux:** Ctrl+Shift+R

### Step 3: Restart Dev Server

```bash
# Stop current server (Ctrl+C if running)
pnpm dev
```

### Step 4: Test Login Flow

1. Go to `http://localhost:3000/auth`
2. Click "Continue with Google"
3. Complete OAuth
4. Should redirect to `/contacts`
5. You should be logged in ✅

---

## 🔍 How to Verify It's Fixed

### Check Cookies After Login:

1. Open DevTools → **Application** → **Cookies** → `http://localhost:3000`
2. You should see:
   - ✅ `sb-pezchazchhnmygpdgzma-auth-token`
   - ✅ `sb-pezchazchhnmygpdgzma-auth-token-code-verifier`
   - ❌ NO `sb-pqfsbxcbsxuyfgqrxdob-*` cookies

### Check Server Logs:

After login, you should see:
```
[/api/import/google/start] User: <user-id> Error: undefined
```
NOT:
```
[/api/import/google/start] User: undefined Error: Auth session missing!
```

---

## 💡 Why This Happened

You likely:
- Switched from an old Supabase project to a new one
- Tested with multiple Supabase configurations
- Had environment variables pointing to different projects

The browser cached cookies from the old project (`pqfsbxcbsxuyfgqrxdob`), which are incompatible with your current project (`pezchazchhnmygpdgzma`).

---

## 🎯 Quick Summary

**Problem:** Old Supabase cookies (`sb-pqfsbxcbsxuyfgqrxdob-*`)
**Solution:** Clear cookies, restart server, re-login
**Expected:** New cookies (`sb-pezchazchhnmygpdgzma-*`)

---

## 🚀 Alternative: Use Incognito Mode

Fastest way to test with clean slate:

1. Open **Incognito/Private window** (Cmd+Shift+N)
2. Go to `http://localhost:3000/auth`
3. Test login flow
4. No old cookies to interfere ✅

If it works in Incognito but not in regular browser → confirms cookie issue.

---

## ⚙️ Files Updated

I've also updated these files to ensure consistency:
- ✅ `.env` - Updated Google OAuth scopes
- ✅ `.env.local` - Already correct
- ✅ `src/lib/google-oauth.ts` - Removed contacts.other.readonly

---

## 📋 Complete Checklist

- [ ] Clear all `sb-pqfsbxcbsxuyfgqrxdob-*` cookies
- [ ] Clear all `sb-*` cookies for localhost:3000
- [ ] Hard refresh browser (Cmd+Shift+R)
- [ ] Restart dev server (`pnpm dev`)
- [ ] Test login at `/auth`
- [ ] Verify new cookies in DevTools
- [ ] Confirm redirect to `/contacts` works
- [ ] Verify no "Auth session missing!" errors

---

**Once cookies are cleared, everything should work!** 🎉
