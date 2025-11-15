# Google Auth & Profile Update Fixes

## Issues Fixed

### 1. **Google Auth Redirect Loop** ✅
**Problem**: After Google sign-in, new users were asked to select role (student/company), then redirected to home page, which immediately sent them back to landing page, creating a confusing loop.

**Root Cause**: 
- After role selection, user was redirected to "/" (home)
- The home page checks if `onboarding_completed === false`
- Since it was false for new users, it redirected them to onboarding
- But the redirect logic wasn't working properly, causing confusion

**Fix**:
- In `frontend/src/pages/Common/Auth.tsx` → `handleRoleSubmit()`
- Changed redirect from `navigate('/')` to proper onboarding path:
  ```typescript
  // Navigate to onboarding instead of home to complete profile setup
  const onboardingPath = role === 'student' ? '/onboarding' : '/onboarding/company';
  navigate(onboardingPath, { replace: true });
  ```
- Added success toast: `toast.success('Account created successfully!')`

**Result**: New Google users now flow: Sign in → Select Role → Onboarding → Home ✅

---

### 2. **Profile Update Errors Not Shown to User** ✅
**Problem**: When profile updates failed during onboarding, users only saw generic "Failed to complete setup" message, not the actual validation error.

**Root Cause**:
- Backend validation errors (e.g., "Bio must be at least 50 characters") were returned with detailed messages
- Frontend wasn't extracting and displaying these detailed error messages
- Onboarding component caught errors but only showed generic message

**Fix**:

**Backend** (`backend/controller/student/create.ts`, `company/create.ts`, `student/update.ts`, `company/update.ts`):
```typescript
catch (error: any) {
  console.error('Profile creation error:', error);
  
  // Return detailed validation errors
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map((e: any) => e.message);
    return res.status(400).json({ 
      error: 'Validation failed',
      details: messages.join(', ')
    });
  }
  
  res.status(500).json({ error: error.message || 'Failed to create profile' });
}
```

**API Client** (`frontend/src/lib/api.ts`):
```typescript
if (!response.ok) {
  const errorData = await response.json();
  // Combine error and details for better user feedback
  const errorMessage = errorData.details 
    ? `${errorData.error}: ${errorData.details}`
    : (errorData.error || 'API request failed');
  throw new Error(errorMessage);
}
```

**Frontend** (`frontend/src/pages/Common/Onboarding.tsx`):
```typescript
catch (error: any) {
  console.error('Onboarding completion error:', error);
  
  // Show the actual error message from backend
  const errorMessage = error.message || error.error || 'Failed to complete setup';
  toast.error(errorMessage, {
    description: 'Please check all fields and try again',
    duration: 5000,
  });
}
```

**Result**: Users now see specific validation errors like "Validation failed: Bio must be at least 50 characters, Phone is required" ✅

---

### 3. **User Name and Email Not Collected from Google** ✅
**Problem**: When users signed in with Google, their name wasn't properly extracted from Google's user metadata, causing issues or fallback to email username.

**Root Cause**:
- Google OAuth returns user data in `user_metadata` object
- The field name varies: could be `full_name`, `name`, or `display_name`
- Code only checked `full_name` and `name`, missing `display_name`
- No logging to debug what data Google actually returns

**Fix**:

**Auth.tsx** - Enhanced name extraction with better fallback chain:
```typescript
// Extract name from Google metadata with fallback chain
const userMetadata = googleUserData.user.user_metadata || {};
const fullName = userMetadata.full_name || 
                 userMetadata.name || 
                 userMetadata.display_name ||
                 googleUserData.user.email?.split('@')[0] || 
                 'User';

console.log('Google user metadata:', userMetadata);
console.log('Extracted full name:', fullName);
```

**Backend initProfile** - Added validation:
```typescript
// Validate required fields
if (!email) {
  return res.status(400).json({ error: 'Email is required' });
}
if (!full_name || full_name.trim().length === 0) {
  return res.status(400).json({ error: 'Full name is required' });
}

// Trim full_name before saving
profile = new Profile({
  user_id: id,
  email,
  full_name: full_name.trim(),  // ← Trim whitespace
  role: role || 'student',
  avatar_url: avatar_url || null,
  onboarding_completed: false,
});
```

**createBackendProfile** - Added detailed logging:
```typescript
const payload = {
  id: userId,
  email: userData.email || email,
  full_name: userData.full_name || fullName,
  role: userData.role || role,
};

console.log('Creating backend profile with payload:', payload);
// ... rest of code
console.log('Backend profile created successfully:', result);
```

**Result**: 
- Names are properly extracted from multiple Google metadata fields
- Empty/whitespace names are rejected with clear error
- Console logs help debug any future issues
- Email fallback ensures user always has a name ✅

---

## Testing Checklist

### Google Auth Flow
- [ ] Sign in with Google (new user)
- [ ] Select "Student" role → Should go to student onboarding
- [ ] Select "Company" role → Should go to company onboarding
- [ ] Complete onboarding → Should go to home page
- [ ] Check user's name is displayed correctly in UI

### Profile Update Errors
- [ ] Try to submit onboarding with bio < 50 characters
- [ ] Try to submit without required fields (phone, university, etc.)
- [ ] Verify specific error messages are shown in toast
- [ ] Verify error toast stays visible long enough to read (5 seconds)

### Name Collection
- [ ] Check browser console for "Google user metadata" log
- [ ] Verify "Extracted full name" log shows correct name
- [ ] Check database to ensure `full_name` field is populated
- [ ] Test with different Google accounts (Gmail, Workspace, etc.)

---

## Files Modified

### Frontend
1. `frontend/src/pages/Common/Auth.tsx`
   - Fixed Google OAuth redirect to onboarding
   - Enhanced name extraction with better fallbacks
   - Added detailed logging for debugging

2. `frontend/src/pages/Common/Onboarding.tsx`
   - Improved error handling with detailed messages
   - Added error description in toast

3. `frontend/src/lib/api.ts`
   - Enhanced error extraction to include details field
   - Better error message formatting

### Backend
4. `backend/controller/auth/initProfile.ts`
   - Added validation for email and full_name
   - Added logging for debugging
   - Trim full_name before saving

5. `backend/controller/student/create.ts`
   - Added validation error handling with details

6. `backend/controller/student/update.ts`
   - Added validation error handling with details

7. `backend/controller/company/create.ts`
   - Added validation error handling with details

8. `backend/controller/company/update.ts`
   - Added validation error handling with details

---

## Additional Improvements Made

1. **Better Error Visibility**: All validation errors now show exact field names and requirements
2. **Enhanced Logging**: Console logs at critical points help debug issues in production
3. **Trim Whitespace**: Full names are trimmed to prevent empty/whitespace-only names
4. **Success Feedback**: Added success toast when account is created
5. **Consistent Error Format**: Backend consistently returns `{ error, details }` structure

---

## Future Considerations

1. **Avatar Extraction**: Consider extracting user's Google profile picture to `avatar_url`
2. **Email Verification**: Google emails are already verified, could set a flag
3. **Rate Limiting**: Add rate limits on profile creation to prevent abuse
4. **Analytics**: Track onboarding completion rates and drop-off points
