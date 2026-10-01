const express = require("express");
const http = require("http");
const { initSocket } = require("./socket");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const env = require("./config/env");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const teamRoutes = require("./routes/team.routes");
const matchingRoutes = require("./routes/matching.routes");
const githubRoutes = require("./routes/github.routes");
const hackathonRoutes = require("./routes/hackathon.routes");
const aiRoutes = require("./routes/ai.routes");

const {
  notFound,
  errorHandler
} = require("./middleware/error.middleware");

const app = express();

/*
 * Basic Express configuration
 */
app.disable("x-powered-by");

// Security Headers
app.use(helmet());

// CORS should be before rate limiter so blocked requests still get CORS headers
app.use(
  cors({
    origin: [env.clientUrl, "http://localhost:5173", "http://localhost:5174"],
    credentials: true
  })
);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, 
  legacyHeaders: false, 
});
app.use(limiter);

app.use(
  express.json({
    limit: "1mb"
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb"
  })
);

/*
 * Health check
 */
app.get("/health", (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      service: "KEVIN API",
      status: "healthy",
      environment: env.nodeEnv,
      timestamp: new Date().toISOString()
    }
  });
});

/*
 * API routes
 */
app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use("/api/teams", teamRoutes);

app.use("/api/matching", matchingRoutes);

app.use("/api/github", githubRoutes);

app.use("/api/hackathons", hackathonRoutes);

app.use("/api/ai", aiRoutes);

/*
 * 404 handler
 */
app.use(notFound);

/*
 * Global error handler
 */
app.use(errorHandler);

/*
 * Start server only when this file is executed directly.
 */
if (require.main === module) {
  const startServer = async () => {
    try {
      await connectDB();

      const server = http.createServer(app);
      initSocket(server);

      server.listen(env.port, () => {
        console.log(
          `KEVIN API & WebSocket running on http://localhost:${env.port}`
        );
      });
    } catch (error) {
      console.error(
        "Failed to start KEVIN API:",
        error.message
      );

      process.exit(1);
    }
  };

  startServer();
}

module.exports = app;