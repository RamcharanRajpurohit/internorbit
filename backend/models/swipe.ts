import mongoose, { Schema, Document, Types } from 'mongoose';

// TypeScript interface for the Swipe document
export interface ISwipe extends Document {
  student_id: Types.ObjectId;
  internship_id: Types.ObjectId;
  direction: 'left' | 'right';
  swiped_at: Date;
}

// Mongoose schema definition
const SwipeSchema: Schema = new Schema<ISwipe>(
  {
    student_id: {
      type: Schema.Types.ObjectId,
      ref: 'StudentProfile',
      required: [true, 'Student ID is required'],
      index: true,
    },
    internship_id: {
      type: Schema.Types.ObjectId,
      ref: 'Internship',
      required: [true, 'Internship ID is required'],
      index: true,
    },
    direction: {
      type: String,
      required: [true, 'Swipe direction is required'],
      enum: {
        values: ['left', 'right'],
        message: '{VALUE} is not a valid swipe direction',
      },
      index: true,
    },
    swiped_at: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
  },
  {
    timestamps: {
      createdAt: 'swiped_at',
      updatedAt: false,
    },
  }
);

// Compound unique index to prevent duplicate swipes
SwipeSchema.index(
  { student_id: 1, internship_id: 1 },
  { unique: true }
);

// Compound indexes for efficient queries
SwipeSchema.index({ student_id: 1, direction: 1, swiped_at: -1 });
SwipeSchema.index({ internship_id: 1, direction: 1 });

// Instance methods
SwipeSchema.methods.isRightSwipe = function (): boolean {
  return this.direction === 'right';
};

SwipeSchema.methods.isLeftSwipe = function (): boolean {
  return this.direction === 'left';
};

// Static methods
SwipeSchema.statics.findRightSwipesByStudent = function (
  studentId: Types.ObjectId
) {
  return this.find({
    student_id: studentId,
    direction: 'right',
  })
    .populate('internship_id')
    .sort({ swiped_at: -1 });
};

SwipeSchema.statics.findLeftSwipesByStudent = function (
  studentId: Types.ObjectId
) {
  return this.find({
    student_id: studentId,
    direction: 'left',
  }).sort({ swiped_at: -1 });
};

SwipeSchema.statics.getSwipedInternshipIds = async function (
  studentId: Types.ObjectId
): Promise<Types.ObjectId[]> {
  const swipes = await this.find({ student_id: studentId }).select(
    'internship_id'
  );
  return swipes.map((swipe: ISwipe) => swipe.internship_id);
};

SwipeSchema.statics.hasSwipedOn = async function (
  studentId: Types.ObjectId,
  internshipId: Types.ObjectId
): Promise<boolean> {
  const swipe = await this.findOne({
    student_id: studentId,
    internship_id: internshipId,
  });
  return !!swipe;
};

SwipeSchema.statics.getSwipeStats = async function (
  internshipId: Types.ObjectId
) {
  const rightSwipes = await this.countDocuments({
    internship_id: internshipId,
    direction: 'right',
  });
  const leftSwipes = await this.countDocuments({
    internship_id: internshipId,
    direction: 'left',
  });

  return {
    right: rightSwipes,
    left: leftSwipes,
    total: rightSwipes + leftSwipes,
    interestRate:
      rightSwipes + leftSwipes > 0
        ? (rightSwipes / (rightSwipes + leftSwipes)) * 100
        : 0,
  };
};

// Export the model
export const Swipe = mongoose.model<ISwipe>('Swipe', SwipeSchema);
