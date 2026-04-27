// Load environment variables FIRST
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import { connectPostgres, sequelize } from "./config/postgres.js";
import { connectMongo } from "./config/mongo.js";
import aiServiceManager from "./services/aiServiceManager.js";

// Load PostgreSQL models
import "./pg_models/index.js"; 

// ✅ Import ALL routes at the top
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import shelterRoutes from "./routes/shelterRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";

// Shelter Management Routes
import shelterAuthRoutes from "./routes/shelterAuthRoutes.js";
import shelterRequestRoutes from "./routes/shelterRequestRoutes.js";
import shelterResidentRoutes from "./routes/shelterResidentRoutes.js";
import shelterMedicalRoutes from "./routes/shelterMedicalRoutes.js";

// Debug log (optional)
console.log("Sequelize models loaded:", Object.keys(sequelize.models));

// ✅ Create app
const app = express();

// ✅ Core middleware (BEFORE routes)
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Add this too for form data

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  console.log("Content-Type:", req.headers["content-type"]);
  console.log("Body:", req.body);
  next();
});
// ✅ Mount ALL routes (AFTER middleware)
app.use("/auth", authRoutes);
app.use("/profiles", profileRoutes);
app.use("/ai", aiRoutes);
app.use("/shelters", shelterRoutes);
app.use("/jobs", jobRoutes);
app.use("/assignments", assignmentRoutes);

// Shelter Management Routes
app.use("/shelter/auth", shelterAuthRoutes);
app.use("/shelter/requests", shelterRequestRoutes);
app.use("/shelter/residents", shelterResidentRoutes);
app.use("/shelter/medical", shelterMedicalRoutes);

console.log("✅ All routes initialized");

// Health-check route
app.get("/", (req, res) => res.send("Backend running ✅"));

// Centralized startup
async function startServer() {
  try {
    console.log("🔹 Connecting to PostgreSQL...");
    await connectPostgres();

    console.log("🔹 Connecting to MongoDB...");
    await connectMongo();

    console.log("🔹 Syncing Sequelize models...");
    await sequelize.sync({ alter: true });
    console.log("✅ Tables synced with PostgreSQL");

    // Start AI Service automatically (with lazy loading, it's safe now)
    console.log("🔹 Starting AI Service...");
    const aiStarted = await aiServiceManager.start();
    
    if (aiStarted) {
      console.log("✅ AI Service is ready! (Models will load on first use)");
    } else {
      console.warn("⚠️  AI Service failed to start. AI features will be unavailable.");
      console.warn("   You can start it manually: cd homeless-aid-platform/backend && python api/app.py");
    }

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`\n${"=".repeat(60)}`);
      console.log(`🚀 Server started on port ${PORT}`);
      console.log(`${"=".repeat(60)}`);
      console.log(`\n📡 Services:`);
      console.log(`   • Node.js Backend:  http://localhost:${PORT}`);
      console.log(`   • Python AI Service: ${process.env.AI_SERVICE_URL || 'http://localhost:5001'}`);
      console.log(`\n🎮 GPU Status: ${aiStarted ? 'Active (RTX 3060)' : 'Not available'}`);
      console.log(`\n📚 API Endpoints:`);
      console.log(`   • Health: GET /ai/health`);
      console.log(`   • Recommendations: GET /ai/recommendations/shelters/:id`);
      console.log(`   • Risk Assessment: GET /ai/risk/assess/:id`);
      console.log(`   • Statistics: GET /ai/statistics`);
      console.log(`\n${"=".repeat(60)}\n`);
    });
  } catch (err) {
    console.error("❌ Error during startup:", err.message);
    process.exit(1);
  }
}

startServer();