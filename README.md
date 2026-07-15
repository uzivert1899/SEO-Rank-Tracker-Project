# SEO Rank Tracker 🚀

An AI-powered full-stack SEO analytics platform built with the MERN stack. Analyze any website's SEO health, track keyword rankings on Google, view competitor data, and download detailed PDF reports — all powered by Google Gemini AI and SerpAPI.

---

## 🌟 Features

### 1. AI-Powered SEO Analyzer
- Enter any URL and get a comprehensive SEO audit in seconds
- Scrapes the entire page using **Cheerio + Axios** — extracts meta tags, headings, links, images, load time, word count, and page size
- **Google Gemini AI** analyzes the scraped data and returns:
  - Overall SEO score (0–100)
  - Category scores — SEO, Performance, Accessibility, Best Practices
  - Issues sorted by severity — Critical, Warning, Info
  - Top keywords with density percentages
- Background job pattern — server responds immediately with an analysis ID while processing continues asynchronously
- Frontend polls every 2 seconds until analysis is complete

### 2. PDF Report Download
- Download a professionally designed PDF report for any SEO analysis
- Built with **PDFKit** — includes overall score, category scores, page metrics, meta data, heading structure, keyword table, and all issues with recommendations
- Color-coded severity levels — red for critical, orange for warning, blue for info

### 3. Keyword Rank Tracker
- Enter a keyword + website URL to track your Google search ranking
- Uses **SerpAPI** to search top 100 Google results and find your domain's position
- Automatically detects top 10 competitor sites ranking above you
- Stores rank history per day — track position changes over time
- Custom rank history chart built with **HTML Canvas API** (no chart library)
- **Retry logic** — attempts SerpAPI twice for reliability
- Pause/Resume tracking toggle per keyword
- Manual refresh to check rank on demand

### 4. Competitor Insights
- Competitors are automatically detected when checking keyword rankings
- See each competitor's position, domain, page title, and snippet
- View top 3 competitors on overview, full list on dedicated tab

---

## 🛠️ Tech Stack

### Frontend
| Technology | Usage |
|------------|-------|
| React.js + TypeScript | UI framework |
| React Router v6 | Client-side routing, protected routes |
| Tailwind CSS | Styling |
| Context API | Global state, auth, axios instance |
| HTML Canvas API | Custom rank history chart |
| Axios | HTTP requests with JWT auto-attach |

### Backend
| Technology | Usage |
|------------|-------|
| Node.js + Express.js | REST API server |
| MongoDB + Mongoose | Database and ODM |
| Google Gemini API | AI SEO analysis |
| SerpAPI | Google search rank data |
| Cheerio + Axios | Web scraping |
| PDFKit | PDF report generation |
| JWT + bcrypt | Authentication |

---

## 📁 Project Structure

```
SEO Rank Tracker/
├── server/
│   ├── config/
│   │   └── db.js                     # MongoDB connection
│   ├── controllers/
│   │   ├── analysisController.js     # SEO analysis logic
│   │   ├── authController.js         # Login/Register
│   │   └── rankController.js         # Keyword tracking
│   ├── middleware/
│   │   └── authMiddleware.js         # JWT protect middleware
│   ├── models/
│   │   ├── Analysis.js               # SEO analysis schema
│   │   ├── keywordTracking.js        # Keyword + rank history schema
│   │   └── User.js                   # User schema
│   ├── routes/
│   │   ├── analysisRoutes.js
│   │   ├── authRoutes.js
│   │   └── rankRoutes.js
│   ├── services/
│   │   ├── geminiService.js          # Gemini AI integration
│   │   ├── keywordTrackingService.js # Rank update orchestration
│   │   ├── rankTrackerService.js     # SerpAPI integration
│   │   ├── scraperService.js         # Cheerio web scraper
│   │   └── pdfService.js             # PDFKit report generation
│   ├── .env
│   └── package.json
│
└── client/
    └── src/
        ├── components/
        │   ├── AnalysesCard.tsx
        │   ├── IssueCard.tsx
        │   ├── Loader.tsx
        │   ├── Loading.tsx
        │   ├── Navbar.tsx
        │   ├── ProtectedRoute.tsx
        │   └── ScoreGauge.tsx
        ├── context/
        │   ├── AppContext.tsx         # Auth + axios instance
        │   └── ThemeContext.tsx       # Dark/light mode
        ├── pages/
        │   ├── Analyze.tsx            # URL input + analysis steps
        │   ├── Dashboard.tsx
        │   ├── History.tsx
        │   ├── Home.tsx
        │   ├── Login.tsx
        │   ├── RankDetail.tsx         # Rank detail + canvas chart
        │   ├── RankTracker.tsx        # Keyword list + add modal
        │   └── Report.tsx             # Full SEO report + PDF download
        └── App.tsx
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Google Gemini API Key
- SerpAPI Key

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/seo-rank-tracker.git
cd seo-rank-tracker
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create a `.env` file in the `server` folder:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key
SERPAPI_KEY=your_serpapi_key
```

Start the backend:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
```

### 4. Open in Browser
```
Frontend: http://localhost:5173
Backend:  http://localhost:5000
```

---

## 🔑 Environment Variables

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `MONGO_URI` | MongoDB connection string | [MongoDB Atlas](https://www.mongodb.com/atlas) |
| `JWT_SECRET` | Secret key for signing JWTs | Any random string |
| `GEMINI_API_KEY` | Google Gemini AI API key | [Google AI Studio](https://aistudio.google.com) |
| `SERPAPI_KEY` | SerpAPI key for rank tracking | [SerpAPI](https://serpapi.com) |

---

## 📡 API Endpoints

### Auth
```
POST   /api/auth/register     Register new user
POST   /api/auth/login        Login, returns JWT token
```

### SEO Analysis
```
POST   /api/analysis/analyze  Start new SEO analysis (background job)
GET    /api/analysis/:id      Get analysis by ID (used for polling)
GET    /api/analysis          Get all analyses with pagination
DELETE /api/analysis/:id      Delete analysis
```

### PDF Reports
```
GET    /api/reports/:id/pdf   Download SEO report as PDF
```

### Rank Tracker
```
POST   /api/rank/add          Add keyword to track
GET    /api/rank/list         Get all tracked keywords
GET    /api/rank/:id          Get keyword with full rank history
POST   /api/rank/:id/refresh  Manually refresh rank
PUT    /api/rank/:id/toggle   Pause or resume tracking
DELETE /api/rank/:id          Delete keyword tracking
```

---

## 🏗️ Key Technical Decisions

### Background Job Pattern
The SEO analysis takes 15–30 seconds (scraping + Gemini AI). Instead of blocking the HTTP response, the server:
1. Creates a DB record with `status: "processing"`
2. Responds immediately with an `analysisId`
3. Continues scraping and AI analysis in the background
4. Updates the DB record to `status: "completed"` when done

The frontend polls `/api/analysis/:id` every 2 seconds until status changes.

### Parallel Scraping with Promise.all
For competitor analysis, all URLs are scraped simultaneously:
```javascript
const [yourScrape, ...competitorScrapes] = await Promise.all([
  scrapeUrl(validYourUrl),
  ...validCompetitorUrls.map(url => scrapeUrl(url))
])
```
This reduces total time from O(n) sequential to O(1) parallel.

### SerpAPI Retry Logic
SerpAPI calls are attempted twice for reliability:
```javascript
for (let attempt = 1; attempt <= 2; attempt++) {
  result = await rankTracker(keyword, domain)
  if (result.success && result.data.totalResultsScanned > 0) break
  await new Promise(r => setTimeout(r, result.success ? 3000 : 5000))
}
```

### Custom Canvas Chart
The rank history chart is built from scratch using the HTML Canvas API — no external chart library. Features include high DPI support, gradient fill, dynamic theme colors, and interactive data points.

### API Limit Awareness
SerpAPI has a 100 call/month free tier limit. The system is designed so only explicit user actions (add keyword, manual refresh) consume API calls — no automated background jobs waste the quota.

---

## 🔒 Authentication Flow

```
1. User registers → password hashed with bcrypt → saved to MongoDB
2. User logs in → bcrypt compares password → JWT signed with userId
3. JWT stored in localStorage on frontend
4. All API calls include JWT in Authorization header
5. protect middleware on backend verifies JWT on every protected route
6. req.userId attached to request → controllers use it for data isolation
```

---

## 📊 Data Models

### Analysis Schema
```javascript
{
  userId, url, overallScore,
  categories: { seo, performance, accessibility, bestPractices },
  metaData: { title, description, canonical, robots, ogTitle, ... },
  headings: { h1, h2, h3, h1Texts },
  links: { internal, external, total },
  images: { total, missingAlt, withAlt },
  keywords: [{ word, count, density }],
  issues: [{ severity, category, message, recommendation }],
  loadTime, pageSize, wordCount,
  status: "pending" | "processing" | "completed" | "failed",
  timestamps
}
```

### KeywordTracking Schema
```javascript
{
  userId, keyword, url, domain,
  currentPosition, currentPage,
  bestPosition, positionChange,
  competitors: [{ position, url, domain, title, snippet }],
  rankHistory: [{ date, position, page, title, snippet }],
  active, lastChecked,
  status: "checking" | "completed" | "failed",
  timestamps
}
```

---

## 🎯 Interview Highlights

- **Background jobs** — immediate response pattern with async processing
- **Prompt engineering** — structured Gemini prompts returning consistent JSON
- **Web scraping** — Cheerio parsing with bot detection bypass
- **Canvas API** — custom chart without any library dependency
- **API limit awareness** — designed around SerpAPI's 100 call/month free tier
- **Retry logic** — resilient SerpAPI calls with exponential-style backoff
- **PDF generation** — server-side PDFKit with custom layout and color coding
- **JWT security** — userId isolation on every DB query, not just route protection

---





---

## 🚀 Deployment

### Backend — Render
1. Push code to GitHub
2. Create new Web Service on Render
3. Set build command: `npm install`
4. Set start command: `node server.js`
5. Add all environment variables

### Frontend — Vercel
1. Push code to GitHub
2. Import project on Vercel
3. Set framework to Vite
4. Add environment variable: `VITE_API_URL=your_render_backend_url`
5. Deploy

---





> Built with ❤️ as a portfolio project to demonstrate full-stack MERN development, AI integration, and production-aware system design.
