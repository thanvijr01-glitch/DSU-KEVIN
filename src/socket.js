const socketIo = require("socket.io");
const env = require("./config/env");

let io;
const onlineUsers = new Map(); // teamId -> Set(userId)

const initSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: [env.clientUrl, "http://localhost:5173", "http://localhost:5174"],
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on("connection", (socket) => {
    console.log(`New client connected: ${socket.id}`);

    // User joins a team room
    socket.on("joinTeam", ({ teamId, userId }) => {
      socket.join(teamId);
      socket.teamId = teamId;
      socket.userId = userId;

      if (!onlineUsers.has(teamId)) {
        onlineUsers.set(teamId, new Set());
      }
      if (userId) {
        onlineUsers.get(teamId).add(userId);
      }

      // Broadcast online users
      io.to(teamId).emit("onlineUsers", Array.from(onlineUsers.get(teamId)));
      console.log(`Socket ${socket.id} joined team room: ${teamId}`);
    });

    // Handle typing indicators
    socket.on("typing", ({ teamId, userName, isTyping }) => {
      socket.to(teamId).emit("userTyping", { userName, isTyping });
    });

    // Handle new messages
    socket.on("sendMessage", (data) => {
      const { teamId, message, senderName, senderId, timestamp } = data;
      
      // Broadcast to everyone in the room EXCEPT the sender
      socket.to(teamId).emit("receiveMessage", {
        teamId,
        message,
        senderName,
        senderId,
        timestamp
      });
    });

    // AI Icebreaker Trigger
    socket.on("triggerAIIcebreaker", (teamId) => {
      io.to(teamId).emit("receiveMessage", {
        teamId,
        message: "Hello team! I'm KEVIN Assistant. 👋 Let's win this hackathon! I'm here to help you brainstorm, debug, or figure out your project stack. Just ask me anything in the floating AI widget!",
        senderName: "KEVIN Assistant 🤖",
        senderId: "ai-assistant",
        timestamp: new Date().toISOString()
      });
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
      
      if (socket.teamId && socket.userId) {
        const teamUsers = onlineUsers.get(socket.teamId);
        if (teamUsers) {
          teamUsers.delete(socket.userId);
          io.to(socket.teamId).emit("onlineUsers", Array.from(teamUsers));
        }
      }
    });
  });

  return io;
};

const getIo = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

module.exports = {
  initSocket,
  getIo
};
