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
exports.Profile = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Schema definition
const ProfileSchema = new mongoose_1.Schema({
    user_id: {
        type: String,
        required: [true, 'User ID is required'],
        unique: true,
        index: true,
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        validate: {
            validator: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
            message: 'Please enter a valid email address',
        },
    },
    full_name: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
        minlength: [2, 'Full name must be at least 2 characters'],
        maxlength: [100, 'Full name cannot exceed 100 characters'],
    },
    role: {
        type: String,
        required: [true, 'Role is required'],
        enum: {
            values: ['student', 'company', 'admin'],
            message: '{VALUE} is not a valid role',
        },
        default: 'student',
    },
    avatar_url: {
        type: String,
        trim: true,
        default: null,
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
// 🔍 Indexes
ProfileSchema.index({ role: 1, created_at: -1 });
// 🧩 Middleware to update timestamps
ProfileSchema.pre('save', function (next) {
    this.updated_at = new Date();
    next();
});
// 💪 Instance methods
ProfileSchema.methods.isStudent = function () {
    return this.role === 'student';
};
ProfileSchema.methods.isCompany = function () {
    return this.role === 'company';
};
ProfileSchema.methods.isAdmin = function () {
    return this.role === 'admin';
};
ProfileSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.__v;
    return obj;
};
// 🧠 Static methods
ProfileSchema.statics.findByRole = function (role) {
    return this.find({ role }).sort({ created_at: -1 });
};
ProfileSchema.statics.findByEmail = function (email) {
    return this.findOne({ email: email.toLowerCase() });
};
ProfileSchema.statics.findByUserId = function (user_id) {
    return this.findOne({ user_id });
};
// 🚀 Export model
exports.Profile = mongoose_1.default.model('Profile', ProfileSchema);
