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
exports.CompanyProfile = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Mongoose schema definition
const CompanyProfileSchema = new mongoose_1.Schema({
    user_id: {
        type: String,
        required: [true, 'User ID is required'],
        unique: true,
        index: true,
        trim: true,
    },
    company_name: {
        type: String,
        required: [true, 'Company name is required'],
        trim: true,
        minlength: [2, 'Company name must be at least 2 characters'],
        maxlength: [200, 'Company name cannot exceed 200 characters'],
        index: true,
    },
    description: {
        type: String,
        trim: true,
        minlength: [50, 'Description must be at least 50 characters'],
        maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    website: {
        type: String,
        trim: true,
        lowercase: true,
        validate: {
            validator: function (v) {
                return /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(v);
            },
            message: 'Please enter a valid website URL',
        },
    },
    industry: {
        type: String,
        trim: true,
        index: true,
    },
    company_size: {
        type: String,
        required: [true, 'Company size is required'],
        enum: {
            values: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
            message: '{VALUE} is not a valid company size',
        },
        index: true,
    },
    location: {
        type: String,
        trim: true,
        index: true,
    },
    logo_url: {
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
// Indexes for efficient queries
CompanyProfileSchema.index({ company_name: 'text', description: 'text' });
CompanyProfileSchema.index({ industry: 1, location: 1 });
CompanyProfileSchema.index({ company_size: 1, industry: 1 });
// Pre-save middleware
CompanyProfileSchema.pre('save', function (next) {
    this.updated_at = new Date();
    next();
});
// Methods
CompanyProfileSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.__v;
    return obj;
};
// Export the model
exports.CompanyProfile = mongoose_1.default.model('CompanyProfile', CompanyProfileSchema);
