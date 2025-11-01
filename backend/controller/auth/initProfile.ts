import { Profile } from "../../models/profile";
import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import { CompanyProfile } from "../../models/company-profile";
import { StudentProfile } from "../../models/studnet";

export const initUserProfile = async (req: AuthRequest, res: Response) => {
   const { id, email, full_name, role, avatar_url } = req.body;
  console.log("Initializing profile for user ID:", id);

  try {
    // 🔍 Check if profile already exists by Supabase user_id
    let profile = await Profile.findOne({ user_id: id });

    if (profile) {
      return res.json({ profile, message: 'Profile already exists' });
    }

    // 🆕 Create new profile
    profile = new Profile({
      user_id: id, //
      email,
      full_name: full_name || email.split('@')[0],
      role: role || 'student',
      avatar_url: avatar_url || null,
    });

    await profile.save();

    // Create associated empty/minimal profiles based on role
    try {
      const effectiveRole = role || profile.role;

      if (effectiveRole == 'student') {
        const existingStudent = await StudentProfile.findOne({ user_id: id });
        if (!existingStudent) {
          // Student schema allows minimal creation with only user_id
          const studentProfile = new StudentProfile({ user_id: id });
          await studentProfile.save();
          console.log(`Created StudentProfile for user ${id}`);
        }
      } else if (effectiveRole == 'company') {
        const existingCompany = await CompanyProfile.findOne({ user_id: id });
        if (!existingCompany) {
          // Company schema requires company_name and company_size. Use sensible defaults.
          const companyName = full_name || (email ? email.split('@')[0] : `Company-${id}`);
          const companyProfile = new CompanyProfile({
            user_id: id,
            company_name: companyName,
            company_size: '1-10', // default placeholder to satisfy enum requirement
          });
          await companyProfile.save();
          console.log(`Created CompanyProfile for user ${id}`);
        }
      }
    } catch (auxErr: any) {
      // Log the auxiliary profile creation error but don't fail the main initialization
      console.warn('Auxiliary profile creation warning:', auxErr?.message || auxErr);
    }

    res.status(201).json({ profile, message: 'Profile created successfully' });
  } catch (error: any) {
    console.error('Profile creation error:', error);
    res.status(500).json({ error: error.message || 'Failed to create profile' });
  }
};
