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
exports.Application = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ApplicationSchema = new mongoose_1.Schema({
    internship_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Internship',
        required: [true, 'Internship ID is required'],
        index: true,
    },
    student_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'StudentProfile',
        required: [true, 'Student ID is required'],
        index: true,
    },
    resume_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Resume',
        required: [true, 'Resume ID is required'],
    },
    cover_letter: {
        type: String,
        required: [true, 'Cover letter is required'],
        trim: true,
        maxlength: [5000, 'Cover letter cannot exceed 5000 characters'],
    },
    status: {
        type: String,
        enum: {
            values: ['pending', 'reviewed', 'shortlisted', 'accepted', 'rejected', 'withdrawn'],
            message: '{VALUE} is not a valid status',
        },
        default: 'pending',
        index: true,
    },
    applied_at: {
        type: Date,
        default: Date.now,
        immutable: true,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    },
    reviewed_at: Date,
    feedback: String,
}, {
    timestamps: {
        createdAt: 'applied_at',
        updatedAt: 'updated_at',
    },
});
ApplicationSchema.index({ internship_id: 1, student_id: 1 }, { unique: true });
ApplicationSchema.index({ student_id: 1, status: 1 });
ApplicationSchema.index({ internship_id: 1, status: 1 });
ApplicationSchema.index({ resume_id: 1 }); // NEW: For finding applications by resume
ApplicationSchema.pre('save', function (next) {
    this.updated_at = new Date();
    next();
});
exports.Application = mongoose_1.default.model('Application', ApplicationSchema);
