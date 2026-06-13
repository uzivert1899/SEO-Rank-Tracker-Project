import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/db.js";
import authRouter from "./routes/authRoutes.js";
import rankRouter from "./routes/rankRoutes.js";
import analysisRouter from "./routes/analysisRoutes.js";
import competitorRouter from "./routes/competitorRoutes.js";
import reportRouter from "./routes/reportRoutes.js";
import publicRouter from "./routes/publicRoutes.js";

connectDB();
const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is Running");
});
app.use("/api/auth", authRouter);
console.log("Auth routes loaded");
app.use("/api/rank", rankRouter);
app.use("/api/analysis", analysisRouter);
app.use("/api/competitors", competitorRouter);
app.use("/api/reports", reportRouter);
app.use("/api/public", publicRouter);
console.log("Public routes loaded");

const PORT = process.env.PORT || 5000;
app.use((err, req, res, next) => {
  console.error("Express error:", err.message);
  res.status(500).json({ success: false, message: err.message });
});
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
