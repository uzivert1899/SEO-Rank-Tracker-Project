import Analysis from "../models/Analysis.js";
import CompetitorAnalysis from "../models/CompetitorAnalysis.js";
import { streamSeoAnalysisPdf } from "../services/pdfService.js";

export const downloadReportPdf = async (req, res) => {
  try {
    const report = await Analysis.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!report) {
      return res
        .status(404)
        .json({ success: false, message: "Report not found" });
    }

    const filename = `seo-report-${report._id}.pdf`;
    const competitorAnalysis = await CompetitorAnalysis.findOne({
      userId: req.userId,
      websiteUrl: report.url,
    }).sort({ updatedAt: -1 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    streamSeoAnalysisPdf(report, res, competitorAnalysis);
  } catch (error) {
    console.error("Download report PDF error:", error.message);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
};
