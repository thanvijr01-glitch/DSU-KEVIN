// src/controllers/ai.controller.js
const { chatWithPlatformAI } = require('../services/ai.service');

const platformChat = async (req, res, next) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: { message: "Message is required." }
      });
    }

    const reply = await chatWithPlatformAI(message, history || []);

    return res.status(200).json({
      success: true,
      data: {
        reply
      }
    });
  } catch (error) {
    console.error("AI Chat Error:", error);
    next(error);
  }
};

module.exports = {
  platformChat
};
