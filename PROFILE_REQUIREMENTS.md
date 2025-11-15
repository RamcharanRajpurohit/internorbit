# Profile Completion Requirements

## Student Profile Requirements

For a student profile to be considered **complete**, the following fields MUST be filled:

### Required Fields:
1. **Bio** 
   - Minimum: 50 characters
   - Maximum: 1000 characters
   - Purpose: Tell companies about yourself

2. **University**
   - Must be provided
   - Example: "Stanford University"

3. **Degree**
   - Must be provided
   - Example: "Computer Science", "Business Administration"

4. **Graduation Year**
   - Must be a valid year
   - Example: 2024, 2025

5. **Location**
   - Must be provided
   - Example: "San Francisco, CA"

6. **Skills**
   - At least ONE skill required
   - Can add multiple
   - Example: ["React", "Python", "Machine Learning"]

7. **Phone**
   - Must be provided
   - Used for contact by companies
   - Example: "+1 (555) 123-4567"

### Optional Fields:
- LinkedIn URL (recommended)
- GitHub URL (recommended)
- Resume URL (handled separately via upload)

---

## Company Profile Requirements

For a company profile to be considered **complete**, the following fields MUST be filled:

### Required Fields:
1. **Company Name**
   - Must be provided
   - Minimum: 2 characters
   - Example: "TechCorp Inc."

2. **Description**
   - Minimum: 50 characters
   - Maximum: 5000 characters
   - Purpose: Tell students about your company

3. **Website**
   - Must be a valid URL
   - Example: "https://techcorp.com"

4. **Industry**
   - Must be provided
   - Example: "Technology", "Healthcare", "Finance"

5. **Company Size**
   - Must select from predefined options:
     - "1-10"
     - "11-50"
     - "51-200"
     - "201-500"
     - "501-1000"
     - "1000+"

6. **Location**
   - Must be provided
   - Example: "San Francisco, CA"

### Optional Fields:
- Logo URL (recommended for branding)

---

## Validation Logic

### Backend Validation (TypeScript)

```typescript
// Student Profile Validation
StudentProfileSchema.methods.isProfileComplete = function (): boolean {
  return !!(
    this.bio &&
    this.bio.length >= 50 &&
    this.university &&
    this.degree &&
    this.graduation_year &&
    this.location &&
    this.skills &&
    this.skills.length > 0 &&
    this.phone
  );
};

// Company Profile Validation
CompanyProfileSchema.methods.isProfileComplete = function (): boolean {
  return !!(
    this.company_name &&
    this.description &&
    this.description.length >= 50 &&
    this.website &&
    this.industry &&
    this.company_size &&
    this.location
  );
};
```

---

## Application Restrictions

### What Happens When Profile is Incomplete?

1. **Student attempting to apply:**
   - Application submission is blocked
   - Error message displayed: "Please complete your profile before applying to internships"
   - Profile completion alert shown with link to profile page
   - User directed to complete missing fields

2. **Backend Response:**
   ```json
   {
     "error": "Please complete your profile before applying to internships",
     "profile_incomplete": true,
     "missing_fields": {
       "bio": true,          // true = missing or invalid
       "university": false,   // false = completed
       "degree": false,
       "graduation_year": false,
       "location": true,
       "skills": false,
       "phone": true
     }
   }
   ```

---

## Checking Profile Completion

### Frontend (React/TypeScript)

```typescript
import { useAuth } from '@/hooks/useAuth';

const { user } = useAuth();
const isProfileComplete = user?.profile_completed || user?.profile_complete;

if (!isProfileComplete) {
  // Show completion alert
  // Block application submission
}
```

### Backend (Node.js/Express)

```typescript
const student = await StudentProfile.findOne({ user_id: req.user.id });

if (!student.isProfileComplete()) {
  return res.status(400).json({ 
    error: 'Please complete your profile before applying',
    profile_incomplete: true 
  });
}
```

---

## Profile Completion Status

### Where It's Stored:
- **Database**: `profile_completed` boolean field in StudentProfile/CompanyProfile
- **User Object**: `profile_completed` flag in User type
- **Calculated**: Dynamically on profile fetch and updates

### When It's Updated:
1. **On profile creation** - Set based on provided fields
2. **On profile update** - Recalculated automatically
3. **On getCurrentUser** - Verified and synced
4. **On profile fetch** - Checked and updated if needed

---

## User Experience

### Complete Profile:
✅ Can apply to internships  
✅ Can save jobs  
✅ Applications go through smoothly  
✅ Full access to all features  

### Incomplete Profile:
⚠️ Cannot submit applications  
⚠️ Profile completion alert shown  
⚠️ Directed to complete missing fields  
✅ Can still browse internships  
✅ Can still save jobs for later  
✅ Can upload resumes  

---

## Onboarding Flow & Profile Completion

### New Users (onboarding_completed = false):
1. Redirected to onboarding page automatically
2. Guided through multi-step form
3. All required fields presented
4. Can skip and complete later
5. Dashboard access granted regardless

### After Onboarding:
- If all fields filled → `profile_completed = true`
- If some fields missing → `profile_completed = false`
- Users can update profile anytime from profile page

---

## Common Scenarios

### Scenario 1: Student completes onboarding fully
- `onboarding_completed = true`
- `profile_completed = true`
- Can apply immediately ✅

### Scenario 2: Student skips onboarding
- `onboarding_completed = false`
- `profile_completed = false`
- Can browse but cannot apply ⚠️
- Shown completion alert when trying to apply

### Scenario 3: Student fills profile but misses required field
- `onboarding_completed = true`
- `profile_completed = false`
- Cannot apply until field completed ⚠️
- Clear indication of missing fields

### Scenario 4: Student updates profile later
- `profile_completed` auto-recalculates
- If now complete → can apply ✅
- If still incomplete → blocked ⚠️

---

## Error Messages

### When Profile Incomplete (Frontend):
```
"Please complete your profile before applying to internships"
```

### When Profile Incomplete (Backend):
```json
{
  "error": "Please complete your profile before applying to internships",
  "profile_incomplete": true,
  "missing_fields": { ... }
}
```

### Character Count Too Low:
```
"Bio must be at least 50 characters"
"Description must be at least 50 characters"
```

---

## Best Practices

### For Students:
1. Complete profile during onboarding
2. Write meaningful bio (at least 50 chars)
3. Add multiple relevant skills
4. Include LinkedIn/GitHub for better visibility
5. Keep profile updated

### For Companies:
1. Complete profile during onboarding
2. Write detailed description (at least 50 chars)
3. Add company logo for branding
4. Keep information current
5. Use proper website URL

---

## Troubleshooting

### Profile shows incomplete but all fields filled:
- Check bio/description length (minimum 50 characters)
- Ensure skills array has at least one item
- Verify all required fields are not null/empty
- Try updating profile to trigger recalculation

### Onboarding redirect not working:
- Clear browser cache
- Check user.onboarding_completed flag
- Verify authentication state
- Check console for errors

### Application still blocked after completion:
- Refresh page to update user object
- Verify profile_completed flag in database
- Check backend logs for validation errors
- Ensure all required fields meet criteria

---

## Monitoring & Analytics

### Metrics to Track:
- % of users who complete onboarding
- % of users with complete profiles
- Average time to profile completion
- Most commonly missed fields
- Application conversion rate by profile completion status

### Database Queries:

```javascript
// Count complete vs incomplete student profiles
db.studentprofiles.count({ profile_completed: true })
db.studentprofiles.count({ profile_completed: false })

// Find profiles missing specific fields
db.studentprofiles.find({ 
  $or: [
    { bio: { $exists: false } },
    { bio: { $regex: /^.{0,49}$/ } },
    { university: { $exists: false } },
    // ... other fields
  ]
})
```

---

This document provides complete details on profile completion requirements and validation logic for the InternOrbit platform.
