const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// ✅ TEST ROUTE
app.get("/", (req, res) => {
  console.log("Root route hit!");
  res.send("API is working!");
});

// Routes
const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

