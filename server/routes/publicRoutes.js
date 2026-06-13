import express from "express";
import { getPublicReport } from "../controllers/analysisController.js";

const publicRouter = express.Router();

publicRouter.get("/report/:shareId", getPublicReport);

export default publicRouter;
