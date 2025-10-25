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
exports.SavedInternship = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Mongoose schema definition
const SavedInternshipSchema = new mongoose_1.Schema({
    student_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Student',
        required: [true, 'Student ID is required'],
        index: true,
    },
    internship_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Internship',
        required: [true, 'Internship ID is required'],
        index: true,
    },
    saved_at: {
        type: Date,
        default: Date.now,
        immutable: true,
    },
}, {
    timestamps: {
        createdAt: 'saved_at',
        updatedAt: false,
    },
});
// Compound unique index to prevent duplicate saves
SavedInternshipSchema.index({ student_id: 1, internship_id: 1 }, { unique: true });
// Index for efficient retrieval of saved internships by student
SavedInternshipSchema.index({ student_id: 1, saved_at: -1 });
// Instance methods
SavedInternshipSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.__v;
    return obj;
};
// Static methods
SavedInternshipSchema.statics.findByStudent = function (studentId) {
    return this.find({ student_id: studentId })
        .populate('internship_id')
        .sort({ saved_at: -1 });
};
SavedInternshipSchema.statics.isSaved = async function (studentId, internshipId) {
    const saved = await this.findOne({
        student_id: studentId,
        internship_id: internshipId,
    });
    return !!saved;
};
SavedInternshipSchema.statics.unsave = function (studentId, internshipId) {
    return this.deleteOne({
        student_id: studentId,
        internship_id: internshipId,
    });
};
// Export the model
exports.SavedInternship = mongoose_1.default.model('SavedInternship', SavedInternshipSchema);
