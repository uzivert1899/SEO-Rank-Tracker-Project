/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import {
  AlertCircle,
  BarChart3,
  FileText,
  Globe,
  Image,
  Link as LinkIcon,
  ListChecks,
  Loader2,
  Search,
  Sparkles,
  Tags,
  Users,
} from "lucide-react";
import { useApp } from "../context/AppContext";

interface SeoMetrics {
  wordCount: number;
  h1Count: number;
  h2Count: number;
  imageCount: number;
  internalLinks: number;
}

interface CompetitorMetrics extends Partial<SeoMetrics> {
  url: string;
  error?: string;
}

interface AiRecommendations {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  priorityActions: string[];
}

const metricRows = [
  { key: "wordCount", label: "Word Count", icon: <FileText size={16} /> },
  { key: "h1Count", label: "H1 Count", icon: <Tags size={16} /> },
  { key: "h2Count", label: "H2 Count", icon: <ListChecks size={16} /> },
  { key: "imageCount", label: "Images", icon: <Image size={16} /> },
  {
    key: "internalLinks",
    label: "Internal Links",
    icon: <LinkIcon size={16} />,
  },
] as const;

export default function CompetitorAnalysis() {
  const { api } = useApp();
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userMetrics, setUserMetrics] = useState<SeoMetrics | null>(null);
  const [competitorsMetrics, setCompetitorsMetrics] = useState<
    CompetitorMetrics[]
  >([]);
  const [missingTopics, setMissingTopics] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiRecommendations, setAiRecommendations] =
    useState<AiRecommendations | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!websiteUrl.trim() || !keyword.trim()) return;

    setLoading(true);
    setError("");
    setUserMetrics(null);
    setCompetitorsMetrics([]);
    setMissingTopics([]);
    setAiError("");
    setAiRecommendations(null);

    try {
      const res = await api.post("/api/competitors/analyze", {
        websiteUrl: websiteUrl.trim(),
        keyword: keyword.trim(),
      });

      if (res.data.success) {
        setUserMetrics(res.data.userMetrics);
        setCompetitorsMetrics(res.data.competitorsMetrics || []);
        setMissingTopics(res.data.missingTopics || []);
      } else {
        setError(res.data.message || "Failed to analyze competitors");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to analyze competitors. Please try again.",
      );
    }

    setLoading(false);
  };

  const getAverageCompetitorMetrics = () => {
    const validCompetitors = competitorsMetrics.filter(
      (competitor) => !competitor.error,
    );

    if (validCompetitors.length === 0) return null;

    return metricRows.reduce((averages, metric) => {
      const total = validCompetitors.reduce(
        (sum, competitor) => sum + (competitor[metric.key] || 0),
        0,
      );
      averages[metric.key] = Math.round(total / validCompetitors.length);
      return averages;
    }, {} as SeoMetrics);
  };

  const handleGenerateRecommendations = async () => {
    if (!userMetrics) return;

    const averageCompetitorMetrics = getAverageCompetitorMetrics();
    if (!averageCompetitorMetrics) {
      setAiError("No competitor metrics available for AI recommendations.");
      return;
    }

    setAiLoading(true);
    setAiError("");
    setAiRecommendations(null);

    try {
      const res = await api.post("/api/competitors/recommendations", {
        userMetrics,
        averageCompetitorMetrics,
        missingTopics,
      });

      if (res.data.success) {
        setAiRecommendations(res.data.recommendations);
      } else {
        setAiError(res.data.message || "Failed to generate recommendations");
      }
    } catch (err: any) {
      setAiError(
        err.response?.data?.message ||
          "Failed to generate recommendations. Please try again.",
      );
    }

    setAiLoading(false);
  };

  const formatValue = (value: number | undefined) =>
    typeof value === "number" ? value.toLocaleString() : "-";

  return (
    <div className="min-h-screen pt-16 md:pt-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-medium text-foreground">
            <span className="gradient-text">Competitor Analysis</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Compare your page structure against the top organic competitors.
          </p>
        </div>

        <form onSubmit={handleAnalyze} className="glass rounded-2xl p-5 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_auto] gap-3">
            <div className="rounded-xl bg-muted border border-border px-4 py-3 flex items-center gap-3">
              <Globe size={18} className="text-muted-foreground shrink-0" />
              <input
                type="text"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="Website URL"
                className="bg-transparent text-sm text-foreground placeholder-muted-foreground outline-none flex-1 min-w-0"
              />
            </div>

            <div className="rounded-xl bg-muted border border-border px-4 py-3 flex items-center gap-3">
              <Search size={18} className="text-muted-foreground shrink-0" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Keyword"
                className="bg-transparent text-sm text-foreground placeholder-muted-foreground outline-none flex-1 min-w-0"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !websiteUrl.trim() || !keyword.trim()}
              className="bg-primary px-5 py-3 rounded-xl text-sm font-semibold text-primary-foreground hover:scale-[1.02] active:scale-95 transition-all duration-150 disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ color: "var(--background)" }}
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <BarChart3 size={18} />
              )}
              Analyze
            </button>
          </div>
        </form>

        {error && (
          <div className="mb-8 px-4 py-3 rounded-xl severity-critical text-sm flex items-center gap-2">
            <AlertCircle size={18} className="shrink-0" />
            {error}
          </div>
        )}

        {loading && (
          <div className="glass rounded-2xl p-12 text-center">
            <Loader2 size={32} className="animate-spin mx-auto text-primary" />
            <p className="text-sm text-muted-foreground mt-4">
              Fetching SERP competitors and scanning pages...
            </p>
          </div>
        )}

        {!loading && userMetrics && (
          <div className="space-y-8">
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Globe size={20} className="text-primary" />
                <h2 className="text-lg font-semibold text-foreground">
                  User Metrics
                </h2>
              </div>

              <div className="glass rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-muted-foreground">
                      <tr>
                        <th className="text-left font-medium px-4 py-3">
                          Metric
                        </th>
                        <th className="text-right font-medium px-4 py-3">
                          Value
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {metricRows.map((metric) => (
                        <tr
                          key={metric.key}
                          className="border-t border-border text-foreground"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">
                                {metric.icon}
                              </span>
                              {metric.label}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right font-semibold">
                            {formatValue(userMetrics[metric.key])}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <Users size={20} className="text-accent" />
                <h2 className="text-lg font-semibold text-foreground">
                  Competitor Metrics
                </h2>
              </div>

              <div className="glass rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[760px]">
                    <thead className="bg-muted/50 text-muted-foreground">
                      <tr>
                        <th className="text-left font-medium px-4 py-3">
                          Competitor
                        </th>
                        {metricRows.map((metric) => (
                          <th
                            key={metric.key}
                            className="text-right font-medium px-4 py-3"
                          >
                            {metric.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {competitorsMetrics.map((competitor, index) => (
                        <tr
                          key={competitor.url}
                          className="border-t border-border text-foreground"
                        >
                          <td className="px-4 py-3 max-w-[280px]">
                            <div className="flex items-start gap-3">
                              <span className="w-8 h-8 rounded-lg bg-accent/10 text-accent border border-accent/20 flex items-center justify-center text-xs font-bold shrink-0">
                                #{index + 1}
                              </span>
                              <div className="min-w-0">
                                <a
                                  href={competitor.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline break-all"
                                >
                                  {competitor.url}
                                </a>
                                {competitor.error && (
                                  <p className="text-xs text-danger mt-1">
                                    {competitor.error}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          {metricRows.map((metric) => (
                            <td
                              key={metric.key}
                              className="px-4 py-3 text-right font-semibold"
                            >
                              {formatValue(competitor[metric.key])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <ListChecks size={20} className="text-warning" />
                <h2 className="text-lg font-semibold text-foreground">
                  Missing Topics
                </h2>
              </div>

              <div className="glass rounded-2xl p-5">
                {missingTopics.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {missingTopics.map((topic) => (
                      <span
                        key={topic}
                        className="px-3 py-1.5 rounded-lg bg-warning/10 border border-warning/20 text-warning text-sm"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No missing H2 topics found from the top competitors.
                  </p>
                )}
              </div>
            </section>

            <section>
              <div className="glass rounded-2xl p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <Sparkles size={20} className="text-accent" />
                      AI Recommendations
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Uses only your metrics, competitor averages, and missing
                      topics.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateRecommendations}
                    disabled={aiLoading}
                    className="bg-primary px-5 py-3 rounded-xl text-sm font-semibold text-primary-foreground hover:scale-[1.02] active:scale-95 transition-all duration-150 disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{ color: "var(--background)" }}
                  >
                    {aiLoading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Sparkles size={18} />
                    )}
                    Generate AI Recommendations
                  </button>
                </div>

                {aiError && (
                  <div className="mt-5 px-4 py-3 rounded-xl severity-critical text-sm flex items-center gap-2">
                    <AlertCircle size={18} className="shrink-0" />
                    {aiError}
                  </div>
                )}

                {aiRecommendations && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-5">
                    {[
                      ["Strengths", aiRecommendations.strengths],
                      ["Weaknesses", aiRecommendations.weaknesses],
                      ["Recommendations", aiRecommendations.recommendations],
                      ["Priority Actions", aiRecommendations.priorityActions],
                    ].map(([title, items]) => (
                      <div
                        key={title as string}
                        className="rounded-xl bg-muted/40 border border-border p-4"
                      >
                        <h3 className="text-sm font-semibold text-foreground mb-3">
                          {title as string}
                        </h3>
                        <ul className="space-y-2">
                          {(items as string[]).map((item) => (
                            <li
                              key={item}
                              className="text-sm text-muted-foreground leading-relaxed"
                            >
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
