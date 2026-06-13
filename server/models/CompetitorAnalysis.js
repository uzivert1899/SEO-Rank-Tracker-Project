import mongoose from "mongoose";

const competitorMetricSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    title: { type: String, default: "" },
    wordCount: { type: Number, default: 0 },
    h1Count: { type: Number, default: 0 },
    h2Count: { type: Number, default: 0 },
    imageCount: { type: Number, default: 0 },
    internalLinks: { type: Number, default: 0 },
  },
  { _id: false },
);

const competitorAnalysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    websiteUrl: { type: String, required: true },
    keyword: { type: String, required: true, trim: true },
    userPageMetrics: {
      title: { type: String, default: "" },
      wordCount: { type: Number, default: 0 },
      h1Count: { type: Number, default: 0 },
      h2Count: { type: Number, default: 0 },
      imageCount: { type: Number, default: 0 },
      internalLinks: { type: Number, default: 0 },
    },
    competitors: [competitorMetricSchema],
    missingTopics: [String],
    aiRecommendations: {
      strengths: [String],
      weaknesses: [String],
      recommendations: [String],
      priorityActions: [String],
    },
  },
  { timestamps: true },
);

competitorAnalysisSchema.index({ userId: 1, keyword: 1, updatedAt: -1 });

const CompetitorAnalysis = mongoose.model(
  "CompetitorAnalysis",
  competitorAnalysisSchema,
);

export default CompetitorAnalysis;
