import express from "express";
import auth from "../middleware/auth.js";
import { downloadReportPdf } from "../controllers/reportController.js";

const reportRouter = express.Router();

reportRouter.get("/:id/pdf", auth, downloadReportPdf);

export default reportRouter;
