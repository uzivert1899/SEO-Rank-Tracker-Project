import PDFDocument from "pdfkit";

const COLORS = {
  text: "#111827",
  muted: "#6b7280",
  border: "#e5e7eb",
  primary: "#2563eb",
  success: "#059669",
  warning: "#d97706",
  danger: "#dc2626",
};

const createPdfBuffer = (buildDocument) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 48, size: "A4" });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    buildDocument(doc);
    doc.end();
  });

const streamPdf = (outputStream, buildDocument) => {
  const doc = new PDFDocument({ margin: 48, size: "A4" });

  doc.pipe(outputStream);
  buildDocument(doc);
  doc.end();
};

const addTitle = (doc, title, subtitle = "") => {
  doc
    .fontSize(28)
    .font("Helvetica-Bold")
    .fillColor(COLORS.primary)
    .text("SEO Intelligence Report", { lineGap: 4 })
    .moveDown(0.3);

  doc.fontSize(11).font("Helvetica").fillColor(COLORS.muted).text(subtitle);

  doc.moveDown(1.2);
};

const addSection = (doc, title) => {
  doc.moveDown(0.9);
  doc.fontSize(14).font("Helvetica-Bold").fillColor(COLORS.primary).text(title);
  doc
    .moveTo(doc.x, doc.y + 8)
    .lineTo(doc.page.width - doc.page.margins.right, doc.y + 8)
    .strokeColor(COLORS.primary)
    .lineWidth(1.5)
    .stroke();
  doc.moveDown(1);
};

const addKeyValueRows = (doc, rows) => {
  rows.forEach(([label, value]) => {
    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor(COLORS.muted)
      .text(`${label}: `, { continued: true })
      .font("Helvetica-Bold")
      .fillColor(COLORS.text)
      .text(value ?? "-");
    doc.moveDown(0.3);
  });
  doc.moveDown(0.2);
};

const addList = (doc, items) => {
  if (!items || items.length === 0) {
    doc.fontSize(10).fillColor(COLORS.muted).text("No data available.");
    return;
  }

  items.forEach((item) => {
    doc.fontSize(10).fillColor(COLORS.text).text(`• ${item}`, {
      indent: 15,
      lineGap: 3,
    });
  });
};

const addOverallScore = (doc, score) => {
  const scoreNum = Number(score) || 0;
  const scoreColor =
    scoreNum >= 80
      ? COLORS.success
      : scoreNum >= 60
        ? COLORS.warning
        : COLORS.danger;

  doc.moveDown(0.5);

  // Background box
  const boxY = doc.y;
  const boxHeight = 90;
  doc
    .rect(
      doc.page.margins.left,
      boxY,
      doc.page.width - doc.page.margins.left - doc.page.margins.right,
      boxHeight,
    )
    .fillColor("#f9fafb")
    .fill();

  // Border
  doc
    .rect(
      doc.page.margins.left,
      boxY,
      doc.page.width - doc.page.margins.left - doc.page.margins.right,
      boxHeight,
    )
    .strokeColor(COLORS.primary)
    .lineWidth(2)
    .stroke();

  doc.moveDown(1);
  doc
    .fontSize(12)
    .font("Helvetica")
    .fillColor(COLORS.muted)
    .text("Overall Score", { align: "center" });

  doc.moveDown(0.3);
  doc
    .fontSize(48)
    .font("Helvetica-Bold")
    .fillColor(scoreColor)
    .text(`${scoreNum}`, { align: "center" });

  doc.moveDown(0.8);
};

const addPageNumbers = (doc, pageNum) => {
  const pageHeight = doc.page.height;
  const pageWidth = doc.page.width;
  const margin = doc.page.margins.bottom;

  doc
    .fontSize(9)
    .fillColor(COLORS.muted)
    .text(`Page ${pageNum}`, pageWidth - 100, pageHeight - margin + 10, {
      align: "right",
      width: 80,
    });
};

const getCompetitorAverages = (competitors = []) => {
  const validCompetitors = competitors.filter(
    (competitor) => !competitor.error,
  );

  if (validCompetitors.length === 0) {
    return {
      wordCount: 0,
      h1Count: 0,
      h2Count: 0,
      imageCount: 0,
      internalLinks: 0,
    };
  }

  const totals = validCompetitors.reduce(
    (sum, competitor) => ({
      wordCount: sum.wordCount + (competitor.wordCount || 0),
      h1Count: sum.h1Count + (competitor.h1Count || 0),
      h2Count: sum.h2Count + (competitor.h2Count || 0),
      imageCount: sum.imageCount + (competitor.imageCount || 0),
      internalLinks: sum.internalLinks + (competitor.internalLinks || 0),
    }),
    {
      wordCount: 0,
      h1Count: 0,
      h2Count: 0,
      imageCount: 0,
      internalLinks: 0,
    },
  );

  return {
    wordCount: Math.round(totals.wordCount / validCompetitors.length),
    h1Count: Math.round(totals.h1Count / validCompetitors.length),
    h2Count: Math.round(totals.h2Count / validCompetitors.length),
    imageCount: Math.round(totals.imageCount / validCompetitors.length),
    internalLinks: Math.round(totals.internalLinks / validCompetitors.length),
  };
};

const addCompetitorAnalysisSections = (doc, analysis) => {
  addSection(doc, "Competitor Analysis");

  if (!analysis) {
    doc
      .fontSize(10)
      .fillColor(COLORS.muted)
      .text("No competitor analysis available.");
    return;
  }

  addKeyValueRows(doc, [
    ["Keyword", analysis.keyword],
    ["Website URL", analysis.websiteUrl],
    ["Analysis Date", new Date(analysis.createdAt).toLocaleString()],
  ]);

  addSection(doc, "Competitor Metrics");
  addSimpleTable(
    doc,
    ["URL", "Words", "H1", "H2", "Images", "Links"],
    (analysis.competitors || []).map((competitor) => [
      competitor.url,
      competitor.wordCount,
      competitor.h1Count,
      competitor.h2Count,
      competitor.imageCount,
      competitor.internalLinks,
    ]),
  );

  const averages = getCompetitorAverages(analysis.competitors || []);
  addSection(doc, "Competitor Averages");
  addKeyValueRows(doc, [
    ["Average Word Count", averages.wordCount],
    ["Average H1 Count", averages.h1Count],
    ["Average H2 Count", averages.h2Count],
    ["Average Images", averages.imageCount],
    ["Average Internal Links", averages.internalLinks],
  ]);

  addSection(doc, "Missing Topics");
  addList(doc, analysis.missingTopics || []);

  addSection(doc, "AI Recommendations");
  addSection(doc, "Strengths");
  addList(doc, analysis.aiRecommendations?.strengths || []);

  addSection(doc, "Weaknesses");
  addList(doc, analysis.aiRecommendations?.weaknesses || []);

  addSection(doc, "Recommendations");
  addList(doc, analysis.aiRecommendations?.recommendations || []);

  addSection(doc, "Priority Actions");
  addList(doc, analysis.aiRecommendations?.priorityActions || []);
};

const addSimpleTable = (doc, headers, rows) => {
  const startX = doc.x;
  const columnWidth =
    (doc.page.width - doc.page.margins.left - doc.page.margins.right) /
    headers.length;

  // Header row
  doc.fontSize(10).font("Helvetica-Bold").fillColor(COLORS.primary);
  headers.forEach((header, index) => {
    doc.text(header, startX + columnWidth * index, doc.y, {
      width: columnWidth - 8,
      continued: index < headers.length - 1,
    });
  });
  doc.moveDown(0.3);

  // Header underline
  doc
    .moveTo(startX, doc.y)
    .lineTo(doc.page.width - doc.page.margins.right, doc.y)
    .strokeColor(COLORS.border)
    .lineWidth(0.5)
    .stroke();
  doc.moveDown(0.3);

  // Data rows
  rows.forEach((row, rowIndex) => {
    const y = doc.y;
    doc.fontSize(9).font("Helvetica").fillColor(COLORS.text);
    row.forEach((cell, index) => {
      doc.text(String(cell ?? "-"), startX + columnWidth * index, y, {
        width: columnWidth - 8,
        continued: index < row.length - 1,
      });
    });
    doc.moveDown(0.3);

    // Subtle row separator
    if (rowIndex < rows.length - 1) {
      doc
        .moveTo(startX, doc.y)
        .lineTo(doc.page.width - doc.page.margins.right, doc.y)
        .strokeColor("#f0f0f0")
        .lineWidth(0.25)
        .stroke();
    }
  });
};

export const generateSeoAnalysisPdf = async (analysis) =>
  createPdfBuffer((doc) => {
    addTitle(
      doc,
      "SEO Intelligence Report",
      `URL: ${analysis.url} | Generated: ${new Date().toLocaleString()}`,
    );

    // Prominent overall score
    addOverallScore(doc, analysis.overallScore);
    doc.moveDown(0.8);

    addSection(doc, "Score Summary");
    addKeyValueRows(doc, [
      ["SEO", analysis.categories?.seo],
      ["Performance", analysis.categories?.performance],
      ["Accessibility", analysis.categories?.accessibility],
      ["Best Practices", analysis.categories?.bestPractices],
      ["Status", analysis.status],
    ]);

    addSection(doc, "Page Metrics");
    addKeyValueRows(doc, [
      ["Load Time", `${analysis.loadTime || 0}ms`],
      ["Page Size", `${Math.round((analysis.pageSize || 0) / 1024)}KB`],
      ["Word Count", analysis.wordCount],
      ["Internal Links", analysis.links?.internal],
      ["External Links", analysis.links?.external],
      ["Images", analysis.images?.total],
      ["Images Missing Alt", analysis.images?.missingAlt],
    ]);

    addSection(doc, "Metadata");
    addKeyValueRows(doc, [
      ["Title", analysis.metaData?.title],
      ["Description", analysis.metaData?.description],
      ["Canonical", analysis.metaData?.canonical],
      ["Robots", analysis.metaData?.robots],
      ["Viewport", analysis.metaData?.viewport],
    ]);

    addSection(doc, "Heading Structure");
    addKeyValueRows(doc, [
      ["H1", analysis.headings?.h1],
      ["H2", analysis.headings?.h2],
      ["H3", analysis.headings?.h3],
      ["H4", analysis.headings?.h4],
      ["H5", analysis.headings?.h5],
      ["H6", analysis.headings?.h6],
    ]);

    addSection(doc, "Top Keywords");
    addSimpleTable(
      doc,
      ["Keyword", "Count", "Density"],
      (analysis.keywords || []).map((keyword) => [
        keyword.word,
        keyword.count,
        keyword.density,
      ]),
    );

    addSection(doc, "Issues");
    (analysis.issues || []).forEach((issue) => {
      const color =
        issue.severity === "critical"
          ? COLORS.danger
          : issue.severity === "warning"
            ? COLORS.warning
            : COLORS.primary;

      doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .fillColor(color)
        .text(issue.severity?.toUpperCase());
      doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor(COLORS.text)
        .text(issue.message || "");
      doc
        .fontSize(9)
        .font("Helvetica")
        .fillColor(COLORS.muted)
        .text(issue.recommendation || "", { lineGap: 2 });
      doc.moveDown(0.6);
    });
  });

export const streamSeoAnalysisPdf = (
  analysis,
  outputStream,
  competitorAnalysis = null,
) => {
  streamPdf(outputStream, (doc) => {
    addTitle(doc, "SEO Intelligence Report", `Website URL: ${analysis.url}`);

    // Prominent overall score
    addOverallScore(doc, analysis.overallScore);
    doc.moveDown(0.8);

    addSection(doc, "Report Summary");
    addKeyValueRows(doc, [
      ["Analysis Date", new Date(analysis.createdAt).toLocaleString()],
      ["SEO Score", analysis.categories?.seo],
      ["Performance Score", analysis.categories?.performance],
      ["Accessibility Score", analysis.categories?.accessibility],
      ["Best Practices Score", analysis.categories?.bestPractices],
    ]);

    addSection(doc, "Page Metrics");
    addKeyValueRows(doc, [
      ["Load Time", `${analysis.loadTime || 0}ms`],
      ["Page Size", `${Math.round((analysis.pageSize || 0) / 1024)}KB`],
      ["Word Count", analysis.wordCount],
    ]);

    if (competitorAnalysis) {
      addCompetitorAnalysisSections(doc, competitorAnalysis);
    }
  });
};

export const generateCompetitorAnalysisPdf = async (analysis) =>
  createPdfBuffer((doc) => {
    addTitle(
      doc,
      "SEO Intelligence Report",
      `Keyword: ${analysis.keyword} | Website: ${analysis.websiteUrl}`,
    );

    addSection(doc, "User Page Metrics");
    addKeyValueRows(doc, [
      ["Word Count", analysis.userPageMetrics?.wordCount],
      ["H1 Count", analysis.userPageMetrics?.h1Count],
      ["H2 Count", analysis.userPageMetrics?.h2Count],
      ["Images", analysis.userPageMetrics?.imageCount],
      ["Internal Links", analysis.userPageMetrics?.internalLinks],
    ]);

    addCompetitorAnalysisSections(doc, analysis);
  });
