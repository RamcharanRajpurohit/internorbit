import { Request, Response } from 'express';
import { SavedInternship } from '../../../../models/saved';
import { StudentProfile } from '../../../../models/studnet';
import { Application } from '../../../../models/applications';
import { deleteSavedInternshipbyId } from './delete';
import { isSavedInternship } from './isSave';
import { SaveInternship } from './saveInternship';

interface AuthRequest extends Request {
  user?: any;
}

const getSavedInternships = async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    console.log("Step 1: Entered /saved-jobs endpoint");

    const skip = (Number(page) - 1) * Number(limit);
    console.log("Step 2: Pagination calculated", { page, limit, skip });

    const student = await StudentProfile.findOne({ user_id: req.user.id });
    console.log("Step 3: Fetched student profile:", student);

    if (!student) {
      console.log("Step 3a: Student profile not found");
      return res.status(404).json({ error: 'Student profile not found' });
    }

    const total = await SavedInternship.countDocuments({ student_id: student._id });
    console.log("Step 4: Total saved internships count:", total);

    const saved = await SavedInternship.find({ student_id: student._id })
      .populate({
        path: 'internship_id',
        populate: {
          path: 'company_id',
          select: 'email full_name',
        },
      })
      .sort({ saved_at: -1 })
      .skip(skip)
      .limit(Number(limit));

    console.log("Step 5: Fetched saved internships:", saved);

    // Add has_applied field to each saved internship
    const savedWithApplicationStatus = await Promise.all(
      saved.map(async (savedJob) => {
        const savedJobObj = savedJob.toObject();
        
        // Check if the internship_id is populated
        if (savedJobObj.internship_id && typeof savedJobObj.internship_id === 'object') {
          const internshipId = (savedJobObj.internship_id as any)._id;
          
          // Check if student has applied to this internship
          const application = await Application.findOne({
            internship_id: internshipId,
            student_id: student._id,
          });
          
          // Add has_applied to the internship object using type assertion
          (savedJobObj.internship_id as any).has_applied = !!application;
        }
        
        return savedJobObj;
      })
    );

    res.json({
      saved: savedWithApplicationStatus,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
      },
    });

    console.log("Step 7: Response sent successfully");
  } catch (error: any) {
    console.error("Step 8: Error occurred", error);
    res.status(500).json({ error: error.message });
  }
};



export { deleteSavedInternshipbyId ,isSavedInternship,getSavedInternships,SaveInternship};