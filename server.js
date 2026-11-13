require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const { initSchema } = require('./src/db/schema');
const { seedDatabase } = require('./src/db/seed');
const apiRouter = require('./src/routes/api');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Database & Karnataka Seed Data
try {
  initSchema();
  seedDatabase();
} catch (err) {
  console.error('Database initialization error:', err);
}

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/frontend', express.static(path.join(__dirname, 'frontend')));
app.use('/locales', express.static(path.join(__dirname, 'locales')));

// Mount API Endpoints
app.use('/api', apiRouter);

// Helper to serve Stitch HTML pages with runtime injection
function serveStitchPage(relativePath) {
  return (req, res) => {
    const fullPath = path.join(__dirname, relativePath);
    if (!fs.existsSync(fullPath)) {
      return res.status(404).send('Page not found: ' + relativePath);
    }

    let html = fs.readFileSync(fullPath, 'utf8');

    // Inject centralized theme stylesheet in <head>
    if (!html.includes('routeless-theme.css')) {
      html = html.replace('</head>', '<link rel="stylesheet" href="/public/css/routeless-theme.css">\n</head>');
    }

    // Inject client runtime script before </body>
    if (!html.includes('routeless-karnataka.js')) {
      const injection = `
        <!-- ROUTELESS Karnataka Full-Stack Runtime Injection -->
        <script src="/public/js/routeless-karnataka.js"></script>
      </body>`;
      html = html.replace('</body>', injection);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  };
}

// Redesigned Karnataka Stitch Frontend Routes
// 1. Home Dashboard (stitch 3)
app.get('/', serveStitchPage('frontend/stitch_routeless_ai_mobility_platform (3)/code.html'));
app.get('/home', serveStitchPage('frontend/stitch_routeless_ai_mobility_platform (3)/code.html'));

// 2. Find Transport & Shared Rides (stitch 4)
app.get('/find-transport', serveStitchPage('frontend/stitch_routeless_ai_mobility_platform (4)/code.html'));
app.get('/routes', serveStitchPage('frontend/stitch_routeless_ai_mobility_platform (4)/code.html'));

// 3. Profile, Onboarding & Settings (stitch 5)
app.get('/profile', serveStitchPage('frontend/stitch_routeless_ai_mobility_platform (5)/code.html'));
app.get('/settings', serveStitchPage('frontend/stitch_routeless_ai_mobility_platform (5)/code.html'));

// 4. My Bookings & Student Pass (stitch 6)
app.get('/my-bookings', serveStitchPage('frontend/stitch_routeless_ai_mobility_platform (6)/code.html'));
app.get('/bookings', serveStitchPage('frontend/stitch_routeless_ai_mobility_platform (6)/code.html'));

// 5. New standalone pages (served from public/)
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public/login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'public/register.html')));
app.get('/student-pass', (req, res) => res.sendFile(path.join(__dirname, 'public/student-pass.html')));
app.get('/ai-chat', (req, res) => res.sendFile(path.join(__dirname, 'public/ai-chat.html')));
app.get('/emergency', (req, res) => res.sendFile(path.join(__dirname, 'public/emergency.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public/admin.html')));

// Attach global error handler
app.use(errorHandler);

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`  ROUTELESS: THE LAST MILE | KARNATAKA              `);
    console.log(`  Autonomous AI Mobility Platform Active            `);
    console.log(`  Pilot Area: Haveri District • 31 Districts Ready  `);
    console.log(`  Server running on http://localhost:${PORT}        `);
    console.log(`  REST API available on http://localhost:${PORT}/api`);
    console.log(`====================================================`);
  });
}

module.exports = app;
