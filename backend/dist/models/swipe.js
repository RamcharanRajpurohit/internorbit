"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Swipe = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Mongoose schema definition
const SwipeSchema = new mongoose_1.Schema({
    student_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'StudentProfile',
        required: [true, 'Student ID is required'],
        index: true,
    },
    internship_id: {
        type: mongoose_1.Schema.Types.ObjectId,
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
}, {
    timestamps: {
        createdAt: 'swiped_at',
        updatedAt: false,
    },
});
// Compound unique index to prevent duplicate swipes
SwipeSchema.index({ student_id: 1, internship_id: 1 }, { unique: true });
// Compound indexes for efficient queries
SwipeSchema.index({ student_id: 1, direction: 1, swiped_at: -1 });
SwipeSchema.index({ internship_id: 1, direction: 1 });
// Instance methods
SwipeSchema.methods.isRightSwipe = function () {
    return this.direction === 'right';
};
SwipeSchema.methods.isLeftSwipe = function () {
    return this.direction === 'left';
};
// Static methods
SwipeSchema.statics.findRightSwipesByStudent = function (studentId) {
    return this.find({
        student_id: studentId,
        direction: 'right',
    })
        .populate('internship_id')
        .sort({ swiped_at: -1 });
};
SwipeSchema.statics.findLeftSwipesByStudent = function (studentId) {
    return this.find({
        student_id: studentId,
        direction: 'left',
    }).sort({ swiped_at: -1 });
};
SwipeSchema.statics.getSwipedInternshipIds = async function (studentId) {
    const swipes = await this.find({ student_id: studentId }).select('internship_id');
    return swipes.map((swipe) => swipe.internship_id);
};
SwipeSchema.statics.hasSwipedOn = async function (studentId, internshipId) {
    const swipe = await this.findOne({
        student_id: studentId,
        internship_id: internshipId,
    });
    return !!swipe;
};
SwipeSchema.statics.getSwipeStats = async function (internshipId) {
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
        interestRate: rightSwipes + leftSwipes > 0
            ? (rightSwipes / (rightSwipes + leftSwipes)) * 100
            : 0,
    };
};
// Export the model
exports.Swipe = mongoose_1.default.model('Swipe', SwipeSchema);
