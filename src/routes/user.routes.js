const express = require("express");

const {
  getUserById,
  updateUser,
  getAllUsers,
  updateActivity,
  getLeaderboard
} = require("../controllers/user.controller");

const {
  protect
} = require("../middleware/auth.middleware");

const router = express.Router();

/*
 * All profile operations require authentication.
 */
router.get("/", protect, getAllUsers);
router.get("/leaderboard", protect, getLeaderboard);
router.post("/activity", protect, updateActivity);
router.get("/:id", protect, getUserById);

router.put("/:id", protect, updateUser);

module.exports = router;