const express = require('express');
const router = express.Router();
const { platformChat } = require('../controllers/ai.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/chat', protect, platformChat);

module.exports = router;
