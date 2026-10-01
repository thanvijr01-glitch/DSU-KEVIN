const mongoose = require("mongoose");

const verifiedSkillSubSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    confidence: {
      type: Number,
      default: 50,
      min: 0,
      max: 100
    },
    evidenceLevel: {
      type: String,
      enum: ["strong", "moderate", "weak"],
      default: "moderate"
    },
    reason: {
      type: String,
      trim: true,
      default: ""
    }
  },
  {
    _id: false
  }
);

const githubEvidenceSchema = new mongoose.Schema(
  {
    repository: {
      type: String,
      trim: true
    },

    url: {
      type: String,
      trim: true
    },

    language: {
      type: String,
      trim: true
    },

    languages: {
      type: [String],
      default: []
    },

    stars: {
      type: Number,
      default: 0,
      min: 0
    },

    commits: {
      type: Number,
      default: 0,
      min: 0
    },

    topics: {
      type: [String],
      default: []
    },

    // --- Multi-dimensional Authenticity & Depth Fields ---
    isFork: {
      type: Boolean,
      default: false
    },

    parentRepo: {
      type: String,
      default: null
    },

    userCommits: {
      type: Number,
      default: 0,
      min: 0
    },

    totalCommits: {
      type: Number,
      default: 0,
      min: 0
    },

    contributionPercentage: {
      type: Number,
      default: 100,
      min: 0,
      max: 100
    },

    codeRatio: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },

    docRatio: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },

    modulesContributed: {
      type: [String],
      default: []
    },

    isSingleCommitDump: {
      type: Boolean,
      default: false
    },

    activeDurationMonths: {
      type: Number,
      default: 0,
      min: 0
    },

    confidenceScore: {
      type: Number,
      default: 50,
      min: 0,
      max: 100
    },

    evidenceLevel: {
      type: String,
      enum: ["strong", "moderate", "weak"],
      default: "moderate"
    },

    evidenceBadge: {
      type: String,
      default: "🟡 Moderate Evidence"
    },

    explanation: {
      type: String,
      default: ""
    },

    verifiedSkills: {
      type: [verifiedSkillSubSchema],
      default: []
    }
  },
  {
    _id: false
  }
);

const githubSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      trim: true,
      default: null
    },

    profileUrl: {
      type: String,
      trim: true,
      default: null
    },

    syncedAt: {
      type: Date,
      default: null
    },

    overallConfidenceScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },

    overallEvidenceLevel: {
      type: String,
      enum: ["strong", "moderate", "weak"],
      default: "moderate"
    },

    repositories: {
      type: [githubEvidenceSchema],
      default: []
    }
  },
  {
    _id: false
  }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must contain at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"]
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [255, "Email cannot exceed 255 characters"],
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address"
      ]
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must contain at least 8 characters"],
      select: false
    },

    college: {
      type: String,
      required: [true, "College is required"],
      trim: true,
      maxlength: [200, "College name cannot exceed 200 characters"]
    },

    studentId: {
      type: String,
      required: [true, "Student ID is required"],
      trim: true,
      maxlength: [100, "Student ID cannot exceed 100 characters"]
    },

    bio: {
      type: String,
      trim: true,
      maxlength: [1000, "Bio cannot exceed 1000 characters"],
      default: ""
    },

    skills: {
      type: [String],
      default: []
    },

    verifiedSkills: {
      type: [verifiedSkillSubSchema],
      default: []
    },

    githubConnected: {
      type: Boolean,
      default: false
    },

    github: {
      type: githubSchema,
      default: () => ({})
    },

    isCollegeVerified: {
      type: Boolean,
      default: false
    },

    // --- Timezone Streaks & Credit Scores ---
    timezone: {
      type: String,
      default: "Asia/Kolkata"
    },

    streakCount: {
      type: Number,
      default: 0
    },

    lastActiveDate: {
      type: Date,
      default: null
    },

    creditScore: {
      type: Number,
      default: 0
    },

    teamsJoined: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

/*
 * Prevent the same student ID from being registered
 * twice inside the same college.
 */
/*
 * Removed unique index for college and studentId to allow easy testing.
 */

/*
 * Remove sensitive fields whenever a User is serialized.
 */
userSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete ret.password;
    delete ret.__v;

    return ret;
  }
});

const User = mongoose.model("User", userSchema);

module.exports = User;