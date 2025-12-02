# Google OAuth Setup - Completion Checklist

## ✅ Step 1: Google Cloud Console - OAuth Consent Screen (COMPLETED by USER)

In **Google Cloud → OAuth consent screen → Scopes**:

- ✅ **Removed**: `.../auth/contacts.other.readonly` (causes additional verification requirements)
- ✅ **Kept**: `.../auth/contacts.readonly` (sufficient for contacts import)
- ✅ **Kept**: Drive/Sheets scopes (for other features)

---

## ✅ Step 2: Contacts Import Code - OAuth Scopes (COMPLETED)

### Changes Made:

**File: `src/lib/google-oauth.ts`**
- ✅ Removed `contacts.other.readonly` from `DEFAULT_SCOPES`
- ✅ Now only includes `contacts.readonly`

**File: `.env.local`**
- ✅ Updated `GOOGLE_PEOPLE_SCOPES` to only include:
  ```bash
  GOOGLE_PEOPLE_SCOPES="https://www.googleapis.com/auth/contacts.readonly"
  ```

### What This Means:
- ✅ OAuth URL builder now only requests `contacts.readonly`
- ✅ No additional Google verification required
- ✅ Users can still import their Google contacts
- ✅ Avoids "unverified app" warnings for test users

---

## ✅ Step 3: Separate Login Flows (VERIFIED - Already Correct)

### Two Distinct OAuth Flows:

#### 1. **Supabase Login** (for authentication)
- **File**: `src/app/auth/page.tsx`
- **Method**: `supabase.auth.signInWithOAuth()`
- **Scopes**: `openid`, `email`, `profile` (managed by Supabase)
- **Client**: Supabase's Google OAuth client
- **Purpose**: User authentication and session management

#### 2. **Google Contacts Import** (for data access)
- **File**: `src/app/api/import/google/start/route.ts`
- **Method**: Direct Google OAuth2Client
- **Scopes**: `contacts.readonly`
- **Client**: Your separate Google OAuth client (GOOGLE_CLIENT_ID)
- **Purpose**: Import user's contacts from Google

✅ **These flows do NOT interfere with each other**

---

## 🔄 Step 4: Add Test Users (ACTION REQUIRED)

### To enable smooth testing without full Google verification:

1. **Go to Google Cloud Console**:
   - Navigate to: [Google Cloud Console](https://console.cloud.google.com/)
   - Select your project

2. **Navigate to OAuth Consent Screen**:
   - Click: **APIs & Services** → **OAuth consent screen**

3. **Add Test Users**:
   - Scroll to **"Test users"** section
   - Click **"+ ADD USERS"**
   - Enter email addresses of people who should test the app:
     ```
     your.email@gmail.com
     tester1@gmail.com
     tester2@gmail.com
     ```
   - Click **SAVE**

### What Each User Type Experiences:

| User Type | Experience |
|-----------|------------|
| **Test Users** (added in console) | ✅ One-click smooth import with no warnings |
| **Everyone Else** | ⚠️ See "unverified app" warning (can still proceed) |
| **With Full Verification** | ✅ Everyone gets smooth experience |

### While App is Unverified:
- ✅ Test users: Full access, no warnings
- ⚠️ Other users: See warning but can still click "Advanced" → "Go to [App Name]"
- ✅ File upload/manual entry: Always available as fallback

---

## 📋 Summary - What You Achieved

### ✅ Benefits:
1. **Real automated contacts import** - Working Google Contacts integration
2. **Minimal Google backlash** - Using only basic, low-risk scope
3. **No loss of Drive/Sheets powers** - Other integrations unaffected
4. **Clear fallbacks** - Users can upload files or enter manually if needed
5. **Test users get smooth experience** - No warnings for approved testers

### 🎯 Current Status:
- ✅ OAuth scopes minimized to avoid verification requirements
- ✅ Separate login and data access flows
- ✅ Code updated and ready to use
- 🔄 **Next**: Add test users in Google Cloud Console (Step 4)

### 📝 Next Steps After Adding Test Users:
1. Test with a test user account
2. Verify contacts import works smoothly
3. Add more test users as needed
4. (Optional) Apply for full Google verification when ready for public launch

---

## 🔐 Environment Variables Reference

```bash
# Google OAuth for Contacts Import
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET
GOOGLE_OAUTH_REDIRECT_URI=http://localhost:3000/api/import/callback/google

# Scopes - ONLY contacts.readonly (no other.readonly)
GOOGLE_PEOPLE_SCOPES="https://www.googleapis.com/auth/contacts.readonly"
```

---

## 🚨 Important Notes

- **Never commit** your `.env.local` file to version control
- Keep `GOOGLE_CLIENT_SECRET` secure
- Test with test users before public release
- File upload remains as fallback if Google OAuth fails
- Supabase handles its own Google OAuth for login (separate from contacts)

