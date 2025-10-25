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
exports.StudentProfile = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Mongoose schema definition
const StudentProfileSchema = new mongoose_1.Schema({
    user_id: {
        type: String,
        required: [true, 'User ID is required'],
        unique: true,
        index: true,
        trim: true,
    },
    bio: {
        type: String,
        trim: true,
        minlength: [50, 'Bio must be at least 50 characters'],
        maxlength: [1000, 'Bio cannot exceed 1000 characters'],
    },
    university: {
        type: String,
        trim: true,
        index: true,
    },
    degree: {
        type: String,
        trim: true,
        index: true,
    },
    graduation_year: {
        type: Number,
        index: true,
    },
    location: {
        type: String,
        trim: true,
        index: true,
    },
    skills: {
        type: [String],
        index: true,
    },
    resume_url: {
        type: String,
        trim: true,
    },
    phone: {
        type: String,
        trim: true,
    },
    linkedin_url: {
        type: String,
        trim: true,
        default: null,
        validate: {
            validator: function (v) {
                if (!v)
                    return true;
                return /^https?:\/\/(www\.)?linkedin\.com\/.*$/.test(v);
            },
            message: 'Please enter a valid LinkedIn URL',
        },
    },
    github_url: {
        type: String,
        trim: true,
        default: null,
        validate: {
            validator: function (v) {
                if (!v)
                    return true;
                return /^https?:\/\/(www\.)?github\.com\/.*$/.test(v);
            },
            message: 'Please enter a valid GitHub URL',
        },
    },
    created_at: {
        type: Date,
        default: Date.now,
        immutable: true,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
});
// Compound indexes for efficient queries
StudentProfileSchema.index({ university: 1, graduation_year: 1 });
StudentProfileSchema.index({ location: 1, graduation_year: 1 });
StudentProfileSchema.index({ skills: 1, graduation_year: 1 });
StudentProfileSchema.index({ bio: 'text' });
// Pre-save middleware
StudentProfileSchema.pre('save', function (next) {
    this.updated_at = new Date();
    next();
});
// Instance methods
StudentProfileSchema.methods.hasSkill = function (skill) {
    return this.skills.some((s) => s.toLowerCase() === skill.toLowerCase());
};
StudentProfileSchema.methods.isRecentGraduate = function () {
    const currentYear = new Date().getFullYear();
    return this.graduation_year >= currentYear - 2;
};
StudentProfileSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.__v;
    return obj;
};
// Static methods
StudentProfileSchema.statics.findByUniversity = function (university) {
    return this.find({ university }).sort({ graduation_year: -1 });
};
StudentProfileSchema.statics.findBySkills = function (skills) {
    return this.find({
        skills: { $in: skills },
    }).sort({ updated_at: -1 });
};
StudentProfileSchema.statics.findByGraduationYear = function (year) {
    return this.find({ graduation_year: year }).sort({ updated_at: -1 });
};
// Export the model
exports.StudentProfile = mongoose_1.default.model('StudentProfile', StudentProfileSchema);
