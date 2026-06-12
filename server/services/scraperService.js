import axios from "axios";
import * as cheerio from "cheerio";

export async function scrapeUrl(url) {
  try {
    const fullUrl = url.startsWith("http") ? url : `https://${url}`;
    const startTime = Date.now();

    const response = await axios.get(fullUrl, {
      timeout: 15000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      maxRedirects: 5,
    });

    const loadTime = Date.now() - startTime;
    const html = response.data;
    const $ = cheerio.load(html);

    // Meta data
    const getMeta = (name) =>
      $(`meta[name="${name}"]`).attr("content") ||
      $(`meta[property="${name}"]`).attr("content") ||
      "";

    const title = $("title").text() || "";
    const description = getMeta("description");
    const canonical = $('link[rel="canonical"]').attr("href") || "";
    const robots = getMeta("robots");
    const ogTitle = getMeta("og:title");
    const ogDescription = getMeta("og:description");
    const ogImage = getMeta("og:image");
    const twitterCard = getMeta("twitter:card");
    const viewport = getMeta("viewport");
    const charset = $("meta[charset]").attr("charset") || "";

    // Headings
    const h1Elements = $("h1");
    const h1Texts = [];
    h1Elements.each((_, el) => h1Texts.push($(el).text().trim()));

    const headings = {
      h1: $("h1").length,
      h2: $("h2").length,
      h3: $("h3").length,
      h4: $("h4").length,
      h5: $("h5").length,
      h6: $("h6").length,
      h1Texts,
    };

    // Links
    const currentHost = new URL(fullUrl).hostname;
    let internalLinks = 0;
    let externalLinks = 0;
    let totalLinks = 0;

    $("a[href]").each((_, el) => {
      const href = $(el).attr("href");
      if (!href || href.startsWith("mailto:") || href.startsWith("tel:"))
        return;
      try {
        const linkUrl = new URL(href, fullUrl);
        totalLinks++;
        if (linkUrl.hostname === currentHost) internalLinks++;
        else externalLinks++;
      } catch {}
    });

    // Images
    const allImages = $("img");
    let missingAlt = 0;
    allImages.each((_, el) => {
      const alt = $(el).attr("alt");
      if (!alt || alt.trim() === "") missingAlt++;
    });

    // Body text
    $("script, style, nav, footer, header").remove();
    const bodyText = $("body").text().replace(/\s+/g, " ").trim();
    const wordCount = bodyText.split(/\s+/).filter((w) => w.length > 0).length;
    const pageSize = html.length;

    return {
      success: true,
      data: {
        url: fullUrl,
        loadTime,
        statusCode: response.status,
        pageSize,
        wordCount,
        metaData: {
          title,
          description,
          canonical,
          robots,
          ogTitle,
          ogDescription,
          ogImage,
          twitterCard,
          viewport,
          charset,
        },
        headings,
        links: {
          internal: internalLinks,
          external: externalLinks,
          total: totalLinks,
        },
        images: {
          total: allImages.length,
          missingAlt,
          withAlt: allImages.length - missingAlt,
        },
        bodyText: bodyText.substring(0, 3000),
      },
    };
  } catch (error) {
    console.error("[SCRAPER] Error:", error.message);
    return { success: false, error: error.message };
  }
}
