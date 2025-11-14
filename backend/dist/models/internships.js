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
exports.Internship = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Mongoose schema definition
const InternshipSchema = new mongoose_1.Schema({
    company_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'CompanyProfile',
        required: [true, 'Company ID is required'],
        index: true,
    },
    title: {
        type: String,
        required: [true, 'Internship title is required'],
        trim: true,
        minlength: [5, 'Title must be at least 5 characters'],
        maxlength: [200, 'Title cannot exceed 200 characters'],
        index: true,
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        minlength: [100, 'Description must be at least 100 characters'],
        maxlength: [10000, 'Description cannot exceed 10000 characters'],
    },
    requirements: {
        type: [String],
        required: [true, 'Requirements are required'],
        validate: {
            validator: function (v) {
                return v && v.length > 0;
            },
            message: 'At least one requirement must be provided',
        },
    },
    responsibilities: {
        type: [String],
        required: [true, 'Responsibilities are required'],
        validate: {
            validator: function (v) {
                return v && v.length > 0;
            },
            message: 'At least one responsibility must be provided',
        },
    },
    location: {
        type: String,
        required: [true, 'Location is required'],
        trim: true,
        index: true,
    },
    is_remote: {
        type: Boolean,
        default: false,
        index: true,
    },
    stipend_min: {
        type: Number,
        required: [true, 'Minimum stipend is required'],
        min: [0, 'Minimum stipend cannot be negative'],
    },
    stipend_max: {
        type: Number,
        required: [true, 'Maximum stipend is required'],
        min: [0, 'Maximum stipend cannot be negative'],
        validate: {
            validator: function (v) {
                return v >= this.stipend_min;
            },
            message: 'Maximum stipend must be greater than or equal to minimum stipend',
        },
    },
    duration_months: {
        type: Number,
        required: [true, 'Duration is required'],
        min: [1, 'Duration must be at least 1 month'],
        max: [24, 'Duration cannot exceed 24 months'],
    },
    skills_required: {
        type: [String],
        required: [true, 'Skills are required'],
        validate: {
            validator: function (v) {
                return v && v.length > 0;
            },
            message: 'At least one skill must be provided',
        },
        index: true,
    },
    application_deadline: {
        type: Date,
        required: [true, 'Application deadline is required'],
        // validate: {
        //   validator: function (v: Date) {
        //     return v > new Date();
        //   },
        //   message: 'Application deadline must be in the future',
        // },
        index: true,
    },
    positions_available: {
        type: Number,
        required: [true, 'Number of positions is required'],
        min: [1, 'At least 1 position must be available'],
        default: 1,
    },
    status: {
        type: String,
        enum: {
            values: ['active', 'closed', 'draft'],
            message: '{VALUE} is not a valid status',
        },
        default: 'draft',
        index: true,
    },
    views_count: {
        type: Number,
        default: 0,
        min: [0, 'Views count cannot be negative'],
    },
    applications_count: {
        type: Number,
        default: 0,
        min: [0, 'Applications count cannot be negative'],
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
InternshipSchema.index({ company_id: 1, status: 1 });
InternshipSchema.index({ status: 1, application_deadline: 1 });
InternshipSchema.index({ location: 1, is_remote: 1, status: 1 });
InternshipSchema.index({ title: 'text', description: 'text' });
InternshipSchema.index({ skills_required: 1, status: 1 });
// Pre-save middleware
InternshipSchema.pre('save', function (next) {
    this.updated_at = new Date();
    next();
});
// Instance methods
InternshipSchema.methods.incrementViews = function () {
    this.views_count += 1;
    return this.save();
};
InternshipSchema.methods.incrementApplications = function () {
    this.applications_count += 1;
    return this.save();
};
InternshipSchema.methods.isExpired = function () {
    return new Date() > this.application_deadline;
};
// Static methods
InternshipSchema.statics.findActiveInternships = function () {
    return this.find({
        status: 'active',
        application_deadline: { $gt: new Date() },
    }).sort({ created_at: -1 });
};
// Export the model
exports.Internship = mongoose_1.default.model('Internship', InternshipSchema);
