const mongoose = require("mongoose");
const Team = require("../models/Team");
const User = require("../models/User");

const createTeam = async (req, res, next) => {
  try {
    const { name, description, theme, maxMembers, guestMembers } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Team name is required"
        }
      });
    }

    // Validate guestMembers if provided
    let parsedGuests = [];
    if (Array.isArray(guestMembers)) {
      parsedGuests = guestMembers.map(g => ({
        name: g.name?.trim() || "Guest",
        role: g.role?.trim() || "Guest Member",
        githubUrl: g.githubUrl?.trim() || ""
      })).filter(g => g.name);
    }

    const team = await Team.create({
      name: name.trim(),
      description: description?.trim() || "",
      theme: theme?.trim() || "",
      maxMembers: maxMembers || 4,
      owner: req.user._id,
      members: [
        {
          user: req.user._id,
          role: "Team Lead",
          status: "accepted"
        }
      ],
      guestMembers: parsedGuests,
      status: "forming"
    });

    // Reward for creating a team
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { creditScore: 20, teamsJoined: 1 }
    });

    await team.populate([
      {
        path: "owner",
        select: "name email college studentId"
      },
      {
        path: "members.user",
        select: "name email college studentId skills github"
      }
    ]);

    return res.status(201).json({
      success: true,
      data: team
    });
  } catch (error) {
    next(error);
  }
};

const getTeamById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Invalid team ID"
        }
      });
    }

    const team = await Team.findById(id)
      .populate("owner", "name email college studentId skills github")
      .populate(
        "members.user",
        "name email college studentId skills github"
      );

    if (!team) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Team not found"
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: team
    });
  } catch (error) {
    next(error);
  }
};

const updateTeam = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Invalid team ID"
        }
      });
    }

    const team = await Team.findById(id);

    if (!team) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Team not found"
        }
      });
    }

    if (team.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: {
          message: "Only the team owner can update the team"
        }
      });
    }

    const allowedFields = [
      "name",
      "description",
      "theme",
      "status",
      "maxMembers",
      "projectLink"
    ];

    const invalidFields = Object.keys(req.body).filter(
      (field) => !allowedFields.includes(field)
    );

    if (invalidFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: `Invalid field(s): ${invalidFields.join(", ")}`
        }
      });
    }

    if (
      req.body.name !== undefined &&
      (!req.body.name || !req.body.name.trim())
    ) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Team name cannot be empty"
        }
      });
    }

    if (req.body.name !== undefined) {
      team.name = req.body.name.trim();
    }

    if (req.body.description !== undefined) {
      team.description = req.body.description.trim();
    }

    if (req.body.theme !== undefined) {
      const newTheme = req.body.theme.trim();

      if (team.theme !== newTheme) {
        team.requiredRoles = [];
      }

      team.theme = newTheme;
    }

    if (req.body.status !== undefined) {
      const allowedStatuses = [
        "forming",
        "complete",
        "closed",
        "showcase"
      ];

      if (!allowedStatuses.includes(req.body.status)) {
        return res.status(400).json({
          success: false,
          error: {
            message:
              "Invalid team status. Allowed values: forming, complete, closed"
          }
        });
      }

      team.status = req.body.status;
    }

    if (req.body.maxMembers !== undefined) {
      const maxMembers = parseInt(req.body.maxMembers);
      if (isNaN(maxMembers) || maxMembers < 1 || maxMembers > 20) {
        return res.status(400).json({
          success: false,
          error: { message: "maxMembers must be between 1 and 20" }
        });
      }
      team.maxMembers = maxMembers;
    }

    if (req.body.projectLink !== undefined) {
      team.projectLink = req.body.projectLink.trim();
    }

    await team.save();

    await team.populate([
      {
        path: "owner",
        select: "name email college studentId"
      },
      {
        path: "members.user",
        select: "name email college studentId skills github"
      }
    ]);

    return res.status(200).json({
      success: true,
      data: team
    });
  } catch (error) {
    next(error);
  }
};

const addMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Invalid team ID"
        }
      });
    }

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Invalid user ID"
        }
      });
    }

    const team = await Team.findById(id);

    if (!team) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Team not found"
        }
      });
    }

    if (team.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: {
          message: "Only the team owner can add members"
        }
      });
    }

    if (team.status === "closed") {
      return res.status(400).json({
        success: false,
        error: {
          message: "Cannot add members to a closed team"
        }
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: "User not found"
        }
      });
    }

    const alreadyMember = team.members.some(
      (member) => member.user.toString() === userId.toString()
    );

    if (alreadyMember) {
      return res.status(409).json({
        success: false,
        error: {
          message: "User is already a team member"
        }
      });
    }

    const totalMembers = team.members.length + team.guestMembers.length;
    if (totalMembers >= team.maxMembers) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Team has reached its maximum size"
        }
      });
    }

    team.members.push({
      user: userId,
      role: role?.trim() || "Team Member",
      status: "pending"
    });

    await team.save();

    await team.populate([
      {
        path: "owner",
        select: "name email college studentId"
      },
      {
        path: "members.user",
        select: "name email college studentId skills github"
      }
    ]);

    return res.status(200).json({
      success: true,
      data: team
    });
  } catch (error) {
    next(error);
  }
};

const removeMember = async (req, res, next) => {
  try {
    const { id, userId } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Invalid team ID"
        }
      });
    }

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Invalid user ID"
        }
      });
    }

    const team = await Team.findById(id);

    if (!team) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Team not found"
        }
      });
    }

    if (team.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: {
          message: "Only the team owner can remove members"
        }
      });
    }

    if (team.owner.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Team owner cannot be removed from the team"
        }
      });
    }

    const memberExists = team.members.some(
      (member) => member.user.toString() === userId.toString()
    );

    if (!memberExists) {
      return res.status(404).json({
        success: false,
        error: {
          message: "User is not a member of this team"
        }
      });
    }

    team.members = team.members.filter(
      (member) => member.user.toString() !== userId.toString()
    );

    await team.save();

    await team.populate([
      {
        path: "owner",
        select: "name email college studentId"
      },
      {
        path: "members.user",
        select: "name email college studentId skills github"
      }
    ]);

    return res.status(200).json({
      success: true,
      data: team
    });
  } catch (error) {
    next(error);
  }
};

const getAllTeams = async (req, res, next) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status) query.status = status;

    const teams = await Team.find(query)
      .populate("owner", "name email college")
      .populate("members.user", "name skills github")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: teams.length,
      data: teams
    });
  } catch (error) {
    next(error);
  }
};

const addGuestMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, role, githubUrl } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, error: { message: "Invalid team ID" } });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: { message: "Guest name is required" } });
    }

    const team = await Team.findById(id);
    if (!team) return res.status(404).json({ success: false, error: { message: "Team not found" } });

    if (team.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: { message: "Only the team owner can add members" } });
    }

    if (team.status === "closed") {
      return res.status(400).json({ success: false, error: { message: "Cannot add members to a closed team" } });
    }

    const totalMembers = team.members.length + team.guestMembers.length;
    if (totalMembers >= team.maxMembers) {
      return res.status(400).json({ success: false, error: { message: "Team has reached its maximum size" } });
    }

    team.guestMembers.push({ name: name.trim(), role: role?.trim() || "Guest Member", githubUrl: githubUrl?.trim() || "" });
    await team.save();
    
    await team.populate([{ path: "owner", select: "name email college studentId" }, { path: "members.user", select: "name email college studentId skills github" }]);
    return res.status(200).json({ success: true, data: team });
  } catch (error) {
    next(error);
  }
};

const removeGuestMember = async (req, res, next) => {
  try {
    const { id, guestId } = req.params;

    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(guestId)) {
      return res.status(400).json({ success: false, error: { message: "Invalid ID" } });
    }

    const team = await Team.findById(id);
    if (!team) return res.status(404).json({ success: false, error: { message: "Team not found" } });

    if (team.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: { message: "Only the team owner can remove members" } });
    }

    team.guestMembers = team.guestMembers.filter(m => m._id.toString() !== guestId.toString());
    await team.save();

    await team.populate([{ path: "owner", select: "name email college studentId" }, { path: "members.user", select: "name email college studentId skills github" }]);
    return res.status(200).json({ success: true, data: team });
  } catch (error) {
    next(error);
  }
};

const deleteTeam = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, error: { message: "Invalid team ID" } });
    }

    const team = await Team.findById(id);
    if (!team) return res.status(404).json({ success: false, error: { message: "Team not found" } });

    if (team.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: { message: "Only the team owner can delete the team" } });
    }

    await Team.findByIdAndDelete(id);

    return res.status(200).json({ success: true, message: "Team successfully deleted" });
  } catch (error) {
    next(error);
  }
};

const getMyTeams = async (req, res, next) => {
  try {
    const teams = await Team.find({
      $or: [
        { owner: req.user._id },
        { "members.user": req.user._id }
      ]
    })
      .populate("owner", "name email college")
      .populate("members.user", "name skills github")
      .sort({ createdAt: -1 });

    const activeTeams = [];
    const pendingInvitations = [];

    teams.forEach(team => {
      // Check if team.owner is populated and not null before accessing _id
      if (team.owner && team.owner._id.toString() === req.user._id.toString()) {
        activeTeams.push(team);
      } else {
        const memberRecord = team.members.find(m => m.user && m.user._id.toString() === req.user._id.toString());
        if (memberRecord) {
          if (memberRecord.status === "pending") {
            pendingInvitations.push(team);
          } else {
            activeTeams.push(team);
          }
        }
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        activeTeams,
        pendingInvitations
      }
    });
  } catch (error) {
    next(error);
  }
};

const respondToInvite = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'accept' or 'decline'

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, error: { message: "Invalid team ID" } });
    }

    if (!["accept", "decline"].includes(action)) {
      return res.status(400).json({ success: false, error: { message: "Invalid action" } });
    }

    const team = await Team.findById(id);
    if (!team) return res.status(404).json({ success: false, error: { message: "Team not found" } });

    const memberIndex = team.members.findIndex(m => m.user.toString() === req.user._id.toString());
    if (memberIndex === -1) {
      return res.status(404).json({ success: false, error: { message: "You don't have an invitation for this team" } });
    }

    if (team.members[memberIndex].status !== "pending") {
      return res.status(400).json({ success: false, error: { message: "You are already an active member of this team" } });
    }

    if (action === "accept") {
      team.members[memberIndex].status = "accepted";
      // Reward for joining a team
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { creditScore: 10, teamsJoined: 1 }
      });
    } else if (action === "decline") {
      team.members.splice(memberIndex, 1);
    }

    await team.save();
    
    await team.populate([
      { path: "owner", select: "name email college studentId" },
      { path: "members.user", select: "name email college studentId skills github" }
    ]);

    return res.status(200).json({ success: true, data: team });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTeam,
  getTeamById,
  getAllTeams,
  getMyTeams,
  updateTeam,
  addMember,
  removeMember,
  addGuestMember,
  removeGuestMember,
  deleteTeam,
  respondToInvite
};