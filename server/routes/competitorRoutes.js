import express from "express";
import auth from "../middleware/auth.js";
import {
  analyzeCompetitors,
  getCompetitorRecommendations,
} from "../controllers/competitorController.js";

const competitorRouter = express.Router();

competitorRouter.post("/analyze", auth, analyzeCompetitors);
competitorRouter.post("/recommendations", auth, getCompetitorRecommendations);

export default competitorRouter;
