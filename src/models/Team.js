const mongoose = require("mongoose");

const teamMemberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    role: {
      type: String,
      trim: true,
      default: "Member",
      maxlength: 100
    },

    joinedAt: {
      type: Date,
      default: Date.now
    },

    status: {
      type: String,
      enum: ["pending", "accepted"],
      default: "accepted"
    }
  },
  {
    _id: false
  }
);

const requiredRoleSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },

    skills: {
      type: [String],
      default: []
    },

    priority: {
      type: Number,
      min: 1,
      max: 5,
      default: 3
    }
  },
  {
    _id: false
  }
);

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Team name is required"],
      trim: true,
      minlength: [2, "Team name must contain at least 2 characters"],
      maxlength: [100, "Team name cannot exceed 100 characters"]
    },

    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
      default: ""
    },

    theme: {
      type: String,
      trim: true,
      maxlength: [3000, "Theme cannot exceed 3000 characters"],
      default: ""
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    members: {
      type: [teamMemberSchema],
      default: []
    },

    guestMembers: {
      type: [
        {
          name: { type: String, required: true },
          role: { type: String, default: "Guest Member" },
          githubUrl: { type: String, default: "" },
          addedAt: { type: Date, default: Date.now }
        }
      ],
      default: []
    },

    maxMembers: {
      type: Number,
      default: 4,
      min: 1,
      max: 20
    },

    requiredRoles: {
      type: [requiredRoleSchema],
      default: []
    },

    status: {
      type: String,
      enum: ["forming", "complete", "closed", "showcase"],
      default: "forming"
    },
    hackathon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hackathon"
    },
    projectLink: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

teamSchema.index({
  owner: 1
});

teamSchema.index({
  status: 1
});

const Team = mongoose.model("Team", teamSchema);

module.exports = Team;