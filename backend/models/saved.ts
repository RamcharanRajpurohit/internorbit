import mongoose, { Schema, Document, Types } from 'mongoose';

// TypeScript interface for the SavedInternship document
export interface ISavedInternship extends Document {
  student_id: Types.ObjectId;
  internship_id: Types.ObjectId;
  saved_at: Date;
}

// Mongoose schema definition
const SavedInternshipSchema: Schema = new Schema<ISavedInternship>(
  {
    student_id: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID is required'],
      index: true,
    },
    internship_id: {
      type: Schema.Types.ObjectId,
      ref: 'Internship',
      required: [true, 'Internship ID is required'],
      index: true,
    },
    saved_at: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
  },
  {
    timestamps: {
      createdAt: 'saved_at',
      updatedAt: false,
    },
  }
);

// Compound unique index to prevent duplicate saves
SavedInternshipSchema.index(
  { student_id: 1, internship_id: 1 },
  { unique: true }
);

// Index for efficient retrieval of saved internships by student
SavedInternshipSchema.index({ student_id: 1, saved_at: -1 });

// Instance methods
SavedInternshipSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

// Static methods
SavedInternshipSchema.statics.findByStudent = function (studentId: Types.ObjectId) {
  return this.find({ student_id: studentId })
    .populate('internship_id')
    .sort({ saved_at: -1 });
};

SavedInternshipSchema.statics.isSaved = async function (
  studentId: Types.ObjectId,
  internshipId: Types.ObjectId
): Promise<boolean> {
  const saved = await this.findOne({
    student_id: studentId,
    internship_id: internshipId,
  });
  return !!saved;
};

SavedInternshipSchema.statics.unsave = function (
  studentId: Types.ObjectId,
  internshipId: Types.ObjectId
) {
  return this.deleteOne({
    student_id: studentId,
    internship_id: internshipId,
  });
};

// Export the model
export const SavedInternship = mongoose.model<ISavedInternship>(
  'SavedInternship',
  SavedInternshipSchema
);
