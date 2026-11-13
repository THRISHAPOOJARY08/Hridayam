// ROUTELESS: THE LAST MILE | KARNATAKA - Complete Test Suite
// Verifies all Karnataka location, transit, voice AI, booking, demand, and theme contracts.

process.env.NODE_ENV = 'test';
process.env.PORT = '3099';

const http = require('http');
const app = require('../server');

let server;
const BASE_URL = 'http://localhost:3099';

let passed = 0;
let failed = 0;
let testToken = '';
let studentId = 1;
let createdBookingId = null;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  options.headers = options.headers || {};
  if (options.body && typeof options.body === 'object') {
    options.body = JSON.stringify(options.body);
    options.headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log('\n======================================================');
  console.log('  ROUTELESS: KARNATAKA - AUTOMATED TEST SUITE        ');
  console.log('======================================================\n');

  server = app.listen(3099);

  try {
    // -------------------------------------------------------------------------
    console.log('--- 1. KARNATAKA 31 DISTRICTS & LOCATION HIERARCHY ---');
    // -------------------------------------------------------------------------
    const distRes = await request('/api/locations/districts');
    assert(distRes.status === 200 && distRes.data.total_districts === 31, 'Supports all 31 districts of Karnataka');
    assert(distRes.data.districts.some(d => d.name === 'Haveri' && d.kannada_name === 'ಹಾವೇರಿ'), 'Includes pilot district Haveri (ಹಾವೇರಿ)');

    const talukRes = await request('/api/locations/taluks?district=Haveri');
    assert(talukRes.status === 200 && talukRes.data.taluks.length >= 7, 'Retrieves Byadgi and Haveri taluks in pilot corridor');

    const stopsRes = await request('/api/locations/stops');
    assert(stopsRes.status === 200 && stopsRes.data.stops.length > 0, 'Retrieves verified Karnataka bus stops');

    // -------------------------------------------------------------------------
    console.log('\n--- 2. AUTHENTICATION, ONBOARDING & PREFERENCES ---');
    // -------------------------------------------------------------------------
    const loginRes = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'sahana@routeless.ai', password: 'Password123!' }
    });
    assert(loginRes.status === 200 && loginRes.data.user.full_name === 'Sahana Gowda', 'Successful login for Sahana Gowda');
    testToken = loginRes.data.token;
    studentId = loginRes.data.user.id;

    // Theme preference (Light, Dark, System)
    const themeRes = await request('/api/users/theme-preference', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${testToken}` },
      body: { preferred_theme: 'dark' }
    });
    assert(themeRes.status === 200 && themeRes.data.preferred_theme === 'dark', 'Persists Dark theme preference in database');

    // Language preference (Kannada)
    const langRes = await request('/api/users/language-preference', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${testToken}` },
      body: { preferred_language: 'kn' }
    });
    assert(langRes.status === 200 && langRes.data.language === 'kn', 'Persists Kannada language preference in database');

    // -------------------------------------------------------------------------
    console.log('\n--- 3. STUDENT DASHBOARD & TODAY\'S TRAVEL ---');
    // -------------------------------------------------------------------------
    const dashRes = await request('/api/student/dashboard', {
      headers: { Authorization: `Bearer ${testToken}` }
    });
    assert(dashRes.status === 200 && dashRes.data.success, 'Retrieves student dashboard data');
    assert(dashRes.data.todays_travel.origin.includes('Byadgi'), 'Populates today\'s Byadgi KSRTC departure');
    assert(dashRes.data.pass.pass_number.includes('KA-HVR'), 'Generates valid Karnataka Student Digital Pass');

    // -------------------------------------------------------------------------
    console.log('\n--- 4. TRANSPORT SEARCH & MULTI-MODAL FILTERING ---');
    // -------------------------------------------------------------------------
    const searchAll = await request('/api/transport/search', {
      method: 'POST',
      body: { origin: 'Byadgi', destination: 'Haveri', mode: 'all' }
    });
    assert(searchAll.status === 200 && searchAll.data.options.length >= 3, 'Returns KSRTC Bus, Shared Cruiser, and Backup Minibus');

    const searchKsrtc = await request('/api/transport/search', {
      method: 'POST',
      body: { mode: 'ksrtc' }
    });
    assert(searchKsrtc.status === 200 && searchKsrtc.data.options.every(o => o.vehicle_type === 'ksrtc'), 'Filters KSRTC buses specifically');

    const searchCruiser = await request('/api/transport/search', {
      method: 'POST',
      body: { mode: 'shared' }
    });
    assert(searchCruiser.status === 200 && searchCruiser.data.options.every(o => o.vehicle_type === 'shared'), 'Filters Shared Cruiser pools');

    // -------------------------------------------------------------------------
    console.log('\n--- 5. CONCURRENCY-SAFE SHARED RIDE BOOKINGS ---');
    // -------------------------------------------------------------------------
    const uniqueStudent = await request('/api/auth/register', {
      method: 'POST',
      body: {
        full_name: 'Kavita Patil',
        email: `kavita_${Date.now()}@routeless.ai`,
        password: 'Password123!',
        role: 'student',
        village: 'Motebennur',
        institution: 'Govt First Grade College, Haveri'
      }
    });
    const kavitaToken = uniqueStudent.data.token;

    // Book seat on Shared Cruiser (Ride #2)
    const bookCruiser = await request('/api/rides/2/book', {
      method: 'POST',
      headers: { Authorization: `Bearer ${kavitaToken}` },
      body: { seats_requested: 1, pickup_stop: 'ಗ್ರಾಮ ಪಂಚಾಯತಿ ಕ್ರಾಸ್' }
    });
    assert(bookCruiser.status === 201 && bookCruiser.data.success, 'Successfully reserves seat in Shared Cruiser');
    createdBookingId = bookCruiser.data.booking.id;

    // Cancel booking and restore seat
    const cancelRes = await request(`/api/rides/bookings/${createdBookingId}/cancel`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${kavitaToken}` }
    });
    assert(cancelRes.status === 200 && cancelRes.data.success, 'Cancels booking and safely restores seat to pool');

    // -------------------------------------------------------------------------
    console.log('\n--- 6. BUS STOP ON DEMAND (PICKUP PETITIONS) ---');
    // -------------------------------------------------------------------------
    const petitionRes = await request('/api/pickups/request', {
      method: 'POST',
      headers: { Authorization: `Bearer ${testToken}` },
      body: {
        district: 'Haveri',
        taluk: 'Byadgi',
        village: 'Mallur',
        landmark: 'Mallur Primary Health Centre Gate',
        destination: 'Govt First Grade College, Haveri',
        passenger_count: 5
      }
    });
    assert(petitionRes.status === 201 && petitionRes.data.success, 'Submits Bus Stop on Demand petition');

    const getPetitions = await request('/api/pickups');
    assert(getPetitions.status === 200 && getPetitions.data.clustered_demand.length > 0, 'Aggregates unmet rural pickup clusters');

    // -------------------------------------------------------------------------
    console.log('\n--- 7. GPS BUS TRACKING (LIVE VS SIMULATED) ---');
    // -------------------------------------------------------------------------
    const trackingRes = await request('/api/tracking/live');
    assert(trackingRes.status === 200 && trackingRes.data.vehicles.length > 0, 'Retrieves vehicle tracking telematics');
    assert(trackingRes.data.vehicles.some(v => v.tracking_badge === 'simulated'), 'Accurately distinguishes Simulated Pilot Location from real GPS');

    // -------------------------------------------------------------------------
    console.log('\n--- 8. AI TRANSPORT ENGINES & PREDICTIVE DEMAND ---');
    // -------------------------------------------------------------------------
    const ghostRes = await request('/api/ai/ghost-routes');
    assert(ghostRes.status === 200 && ghostRes.data.ghost_routes.length > 0, 'Discovers Ghost Routes (e.g. Motebennur Bypass Express)');

    const journeyRes = await request('/api/ai/journey-predictor', {
      method: 'POST',
      body: { origin: 'Motebennur', destination: 'Govt First Grade College, Haveri' }
    });
    assert(journeyRes.status === 200 && journeyRes.data.prediction.success_probability === '94%', 'Calculates Journey Success Predictor reliability score');

    const equityRes = await request('/api/ai/equity-score');
    assert(equityRes.status === 200 && equityRes.data.taluks.length > 0, 'Calculates Transport Equity Score across taluks');

    const demandRes = await request('/api/ai/predictive-demand');
    assert(demandRes.status === 200 && demandRes.data.morning_demand.peak_window.includes('07:15 AM'), 'Predicts morning vs afternoon student demand variance');

    // -------------------------------------------------------------------------
    console.log('\n--- 9. MULTILINGUAL VOICE ASSISTANT (13 INTENTS) ---');
    // -------------------------------------------------------------------------
    const voiceGreeting = await request('/api/assistant/message', {
      method: 'POST',
      body: { text: 'ನಮಸ್ಕಾರ, ನನಗೆ ಕಾಲೇಜಿಗೆ ಹೋಗಲು ಸಹಾಯ ಮಾಡಿ', language: 'kn' }
    });
    assert(voiceGreeting.status === 200 && voiceGreeting.data.intent === 'GREETING', 'Recognizes Kannada Voice Greeting intent');
    assert(voiceGreeting.data.response_text.includes('ರೂಟ್‌ಲೆಸ್ ಕರ್ನಾಟಕ'), 'Generates authentic Kannada Voice Assistant response');

    const voiceStop = await request('/api/assistant/message', {
      method: 'POST',
      body: { text: 'ಹತ್ತಿರದ ಬಸ್ ನಿಲ್ದಾಣ ಎಲ್ಲಿದೆ?', language: 'kn' }
    });
    assert(voiceStop.status === 200 && voiceStop.data.intent === 'FIND_NEARBY_BUS_STOP', 'Recognizes FIND_NEARBY_BUS_STOP intent in Kannada');

    const voicePickup = await request('/api/assistant/message', {
      method: 'POST',
      body: { text: 'ನಮ್ಮ ಹಳ್ಳಿಗೆ ಹೊಸ ಬಸ್ ಸ್ಟಾಪ್ ವಿನಂತಿ ಮಾಡಬೇಕು', language: 'kn' }
    });
    assert(voicePickup.status === 200 && voicePickup.data.intent === 'REQUEST_PICKUP', 'Recognizes REQUEST_PICKUP intent in Kannada');

    // -------------------------------------------------------------------------
    console.log('\n--- 10. REDESIGNED FRONTEND PAGE SERVING ---');
    // -------------------------------------------------------------------------
    const homeHtml = await fetch(`${BASE_URL}/`).then(r => r.text());
    assert(homeHtml.includes('Sahana') && homeHtml.includes('routeless-karnataka.js'), 'Home Dashboard served with runtime injection');

    const findHtml = await fetch(`${BASE_URL}/find-transport`).then(r => r.text());
    assert(findHtml.includes('KSRTC') && findHtml.includes('routeless-karnataka.js'), 'Find Transport served with runtime injection');

    const profileHtml = await fetch(`${BASE_URL}/profile`).then(r => r.text());
    assert(profileHtml.includes('ಭಾಷಾ ಆಯ್ಕೆ') && profileHtml.includes('routeless-karnataka.js'), 'Profile & Settings served with runtime injection');

    const bookingsHtml = await fetch(`${BASE_URL}/my-bookings`).then(r => r.text());
    assert(bookingsHtml.includes('ಸಕ್ರಿಯ ಪ್ರಯಾಣ') && bookingsHtml.includes('routeless-karnataka.js'), 'My Bookings served with runtime injection');

    console.log('\n======================================================');
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('======================================================\n');
  } catch (err) {
    console.error('Test Suite Fatal Error:', err);
    failed++;
  } finally {
    server.close();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
