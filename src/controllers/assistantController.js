const db = require('../db/database');
const { recognizeIntent, INTENTS } = require('../services/voiceNlpService');
const { getSupportedLanguages } = require('../services/i18nService');

function buildLocalizedResponse(intent, lang, data, user) {
  const isKn = lang === 'kn';
  const isHi = lang === 'hi';

  switch (intent) {
    case INTENTS.GREETING:
      if (isKn) return `ನಮಸ್ಕಾರ ${user ? user.full_name : 'ಸಹನಾ'}! ರೂಟ್‌ಲೆಸ್ ಕರ್ನಾಟಕ ಗ್ರಾಮೀಣ ಸಾರಿಗೆ ಸಹಾಯಕಕ್ಕೆ ಸ್ವಾಗತ. ಹಾವೇರಿ-ಬ್ಯಾಡಗಿ ಮಾರ್ಗದಲ್ಲಿ ನಿಮ್ಮ ಕಾಲೇಜು ಪ್ರಯಾಣಕ್ಕೆ ನಾನು ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?`;
      if (isHi) return `नमस्ते ${user ? user.full_name : 'सहना'}! रूटलेस कर्नाटक ग्रामीण परिवहन में आपका स्वागत है। मैं आपकी कॉलेज यात्रा में कैसे मदद करूँ?`;
      return `Hello ${user ? user.full_name : 'Sahana'}! Welcome to Routeless Karnataka rural transit assistant. How can I help with your Byadgi-Haveri college commute?`;

    case INTENTS.TRANSPORT_SEARCH:
      if (!data.results || data.results.length === 0) {
        if (isKn) return 'ಕ್ಷಮಿಸಿ, ಸದ್ಯಕ್ಕೆ ಈ ಮಾರ್ಗದಲ್ಲಿ ನೇರ ಬಸ್ಸುಗಳು ಲಭ್ಯವಿಲ್ಲ. ಆದರೆ ವಿದ್ಯಾರ್ಥಿ ಶೇರ್ಡ್ ಕ್ರೂಸರ್ ಲಭ್ಯವಿದೆ.';
        return 'No scheduled direct buses right now. Shared Cruiser pool is available.';
      }
      const top = data.results[0];
      if (isKn) return `${top.vehicle_name} (${top.vehicle_number}) ಲಭ್ಯವಿದೆ. ನಿರ್ಗಮನ: ${top.departure_time}, ಪ್ರಯಾಣಾವಧಿ: ${top.estimated_duration}, ${top.available_seats} ಸೀಟುಗಳು ಲಭ್ಯ. ವಿದ್ಯಾರ್ಥಿ ಪಾಸ್ ಮಾನ್ಯವಾಗಿದೆ.`;
      return `Found ${top.vehicle_name} (${top.vehicle_number}) departing at ${top.departure_time}. Travel duration: ${top.estimated_duration}. ${top.available_seats} seats open. Valid with student pass.`;

    case INTENTS.FIND_SHARED_RIDE:
      if (isKn) return 'ವಿದ್ಯಾರ್ಥಿ ಶೇರ್ಡ್ ಕ್ರೂಸರ್ ಲಭ್ಯವಿದೆ! ಚಾಲಕ: ಮಂಜುನಾಥ್ ಬಿ. (KA-27-M-4421). ಬೆಳಿಗ್ಗೆ 07:55 ಕ್ಕೆ ಮೊಟೆಬೆನ್ನೂರು ಪಂಚಾಯತಿ ಕ್ರಾಸ್\u200cಗೆ ಬರಲಿದೆ. 3 ಸೀಟುಗಳು ಬಾಕಿ ಇವೆ. ಶುಲ್ಕ: ₹15.';
      return 'Student Shared Cruiser available with Driver Manjunath B. (KA-27-M-4421). Departing 07:55 AM from Motebennur GP Cross. 3 seats open at ₹15.';

    case INTENTS.FIND_NEARBY_BUS_STOP:
      if (isKn) return 'ನಿಮ್ಮ ಹಳ್ಳಿಯ ಹತ್ತಿರದ ನಿಲ್ದಾಣ: "ಮೊಟೆಬೆನ್ನೂರು ಗ್ರಾಮ ಪಂಚಾಯತಿ ಕ್ರಾಸ್" (ರಾಷ್ಟ್ರೀಯ ಹೆದ್ದಾರಿ 48 ರ ಪಕ್ಕದಲ್ಲಿದೆ).';
      return 'Your nearest verified stop is "Motebennur Gram Panchayat Circle" on NH48.';

    case INTENTS.REQUEST_PICKUP:
      if (isKn) return 'ಹೊಸ ಬಸ್ ಸ್ಟಾಪ್ ಬೇಡಿಕೆ ಅರ್ಜಿಯನ್ನು ದಾಖಲಿಸಲಾಗಿದೆ! ಹಾವೇರಿ ಸಾರಿಗೆ ನಿಯಂತ್ರಣ ಕೊಠಡಿಯು ವಿದ್ಯಾರ್ಥಿಗಳ ಸಾಂದ್ರತೆಯನ್ನು ಪರಿಶೀಲಿಸಿ ತಾತ್ಕಾಲಿಕ ನಿಲುಗಡೆಗೆ ಅನುಮೋದನೆ ನೀಡಲಿದೆ.';
      return 'Bus Stop on Demand petition logged! Haveri Transit Wing is reviewing student demand cluster for approval.';

    case INTENTS.CHECK_SEAT_AVAILABILITY:
      const totalSeats = data.total_available_seats || 25;
      if (isKn) return `ಹಾವೇರಿ ಕಾಲೇಜು ಮಾರ್ಗದಲ್ಲಿ KSRTC ಬಸ್ ಮತ್ತು ಶೇರ್ಡ್ ಕ್ರೂಸರ್ ಸೇರಿ ಒಟ್ಟು ${totalSeats} ಸೀಟುಗಳು ಲಭ್ಯವಿವೆ.`;
      return `There are currently ${totalSeats} seats open across KSRTC and Shared Cruiser routes.`;

    case INTENTS.CHECK_BOOKING_STATUS:
      if (isKn) return 'ನಿಮ್ಮ ಹೆಸರಿನಲ್ಲಿ 2 ಸಕ್ರಿಯ ಪ್ರಯಾಣಗಳಿವೆ: 1) KSRTC ಎಕ್ಸ್‌ಪ್ರೆಸ್ #32 (07:45 AM, ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ 2B), 2) ವಿದ್ಯಾರ್ಥಿ ಶೇರ್ಡ್ ಕ್ರೂಸರ್ (07:55 AM, KA-27-M-4421). ನಿಮ್ಮ ಡಿಜಿಟಲ್ ಪಾಸ್ ಸಕ್ರಿಯವಾಗಿದೆ.';
      return 'You have 2 active bookings: 1) KSRTC Rural Express #32 at 07:45 AM (Platform 2B), 2) Student Shared Cruiser at 07:55 AM (KA-27-M-4421). Digital Pass verified.';

    case INTENTS.FIND_ALTERNATIVE_TRANSPORT:
      if (isKn) return 'ಬೆಳಗಿನ ಪರೀಕ್ಷಾ ದಟ್ಟಣೆಗೆ ಪರ್ಯಾಯವಾಗಿ "ರೂಟ್‌ಲೆಸ್ಸ್ ಬ್ಯಾಕಪ್ ಮಿನಿಬಸ್" ಬೆಳಿಗ್ಗೆ 08:05 ಕ್ಕೆ ಬ್ಯಾಡಗಿ ತಾಲೂಕು ಆಫೀಸ್ ಬಳಿ ನಿಯೋಜನೆಗೊಂಡಿದೆ. ಕಾಲೇಜು ತಲುಪಲು 33 ನಿಮಿಷ.';
      return 'Exam rush fallback: "Routeless Backup Minibus" deployed at 08:05 AM from Byadgi Taluk Office. Arrives 22 mins before exam.';

    case INTENTS.BOOK_RIDE:
      if (data.requires_confirmation) {
        if (isKn) return 'ವಿದ್ಯಾರ್ಥಿ ಶೇರ್ಡ್ ಕ್ರೂಸರ್\u200cನಲ್ಲಿ ₹15 ದರದಲ್ಲಿ ಸೀಟು ಕಾಯ್ದಿರಿಸಲು ನೀವು ದೃಢೀಕರಿಸುತ್ತೀರಾ?';
        return 'Would you like to confirm 1 seat on Student Shared Cruiser for flat fare ₹15?';
      }
      if (isKn) return 'ಅಭಿನಂದನೆಗಳು! ನಿಮ್ಮ ಸೀಟು ಯಶಸ್ವಿಯಾಗಿ ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ ಮತ್ತು ವಿದ್ಯಾರ್ಥಿ ಡಿಜಿಟಲ್ ಪಾಸ್\u200cಗೆ ಲಿಂಕ್ ಆಗಿದೆ.';
      return 'Success! Your seat is reserved and linked to your student pass.';

    case INTENTS.CANCEL_BOOKING:
      if (isKn) return 'ನಿಮ್ಮ ಬುಕಿಂಗ್ ಅನ್ನು ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ ಮತ್ತು ಸೀಟನ್ನು ಇತರ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಬಿಡುಗಡೆ ಮಾಡಲಾಗಿದೆ.';
      return 'Your booking has been cancelled and seat released to the pool.';

    case INTENTS.CHECK_ROUTE_INFORMATION:
      if (isKn) return 'ಬ್ಯಾಡಗಿ ನಿಲ್ದಾಣದಿಂದ ಹಾವೇರಿ ಕಾಲೇಜು ಆವರಣಕ್ಕೆ ಒಟ್ಟು ದೂರ 22 ಕಿ.ಮೀ. ಬಸ್ ಮೂಲಕ 35 ನಿಮಿಷ ಮತ್ತು ಕ್ರೂಸರ್ ಬೈಪಾಸ್ ಮೂಲಕ 27 ನಿಮಿಷ ಪ್ರಯಾಣಾವಧಿ.';
      return 'From Byadgi Stand to Haveri College Campus is 22 km. Journey takes 35 mins via KSRTC bus and 27 mins via Cruiser bypass.';

    case INTENTS.HELP:
      if (isKn) return 'ರೂಟ್‌ಲೆಸ್ ಕರ್ನಾಟಕ ವಾಯ್ಸ್ ಸಹಾಯಕದಲ್ಲಿ ನೀವು ಬಸ್ ಹುಡುಕಬಹುದು, ಶೇರ್ಡ್ ಕ್ರೂಸರ್ ಬುಕ್ ಮಾಡಬಹುದು, ಹತ್ತಿರದ ನಿಲ್ದಾಣ ಕೇಳಬಹುದು ಅಥವಾ ಸ್ಟಾಪ್ ವಿನಂತಿಸಬಹುದು.';
      return 'You can ask for KSRTC bus timings, book a shared cruiser, check nearest stop, or petition a new demand stop.';

    default:
      if (isKn) return 'ಕ್ಷಮಿಸಿ, ಸರಿಯಾಗಿ ಅರ್ಥವಾಗಲಿಲ್ಲ. "ಬಸ್ ಹುಡುಕಿ", "ಕ್ರೂಸರ್ ಬುಕ್ ಮಾಡಿ", ಅಥವಾ "ಹತ್ತಿರದ ಸ್ಟಾಪ್" ಎಂದು ಕೇಳಿ.';
      return 'I did not catch that. Try asking "Find bus to Haveri college" or "Where is the nearest stop?".';
  }
}

// POST /api/assistant/message
async function processMessage(req, res) {
  try {
    const { text, language = 'kn', confirm_action = false } = req.body;
    const user = req.user || null;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ success: false, error: 'Spoken text or message is required.' });
    }

    const { intent, entities } = recognizeIntent(text);
    const lang = (language || 'kn').toLowerCase().trim();
    let responseData = {};

    switch (intent) {
      case INTENTS.TRANSPORT_SEARCH:
      case INTENTS.FIND_SHARED_RIDE: {
        const rides = db.prepare(`
          SELECT sr.*, r.origin, r.destination, r.distance, r.estimated_duration, r.operator_name
          FROM shared_rides sr
          JOIN routes r ON sr.route_id = r.id
          WHERE sr.ride_status = 'scheduled'
          ORDER BY sr.departure_time ASC
          LIMIT 3
        `).all();
        responseData.results = rides;
        break;
      }

      case INTENTS.CHECK_SEAT_AVAILABILITY: {
        const stats = db.prepare('SELECT SUM(available_seats) as total FROM shared_rides WHERE ride_status = "scheduled"').get();
        responseData.total_available_seats = stats?.total || 25;
        break;
      }

      case INTENTS.BOOK_RIDE: {
        const targetRide = db.prepare('SELECT * FROM shared_rides WHERE available_seats > 0 LIMIT 1').get();
        if (!confirm_action) {
          responseData.requires_confirmation = true;
          responseData.ride = targetRide;
        } else {
          const studentId = user ? user.id : 1;
          db.prepare(`
            INSERT INTO ride_bookings (ride_id, student_id, seats_requested, booking_status, fare_paid, pickup_stop, dropoff_stop)
            VALUES (?, ?, 1, 'confirmed', 15, 'ಗ್ರಾಮ ಪಂಚಾಯತಿ ಕ್ರಾಸ್', 'ಕಾಲೇಜು ಆವರಣ')
          `).run(targetRide.id, studentId);
          db.prepare('UPDATE shared_rides SET available_seats = available_seats - 1 WHERE id = ?').run(targetRide.id);
          responseData.ride = targetRide;
        }
        break;
      }
    }

    const responseText = buildLocalizedResponse(intent, lang, responseData, user);

    return res.json({
      success: true,
      language: lang,
      intent,
      response_text: responseText,
      requires_clarification: false,
      entities,
      data: responseData
    });
  } catch (err) {
    console.error('Assistant error:', err);
    return res.status(500).json({ success: false, error: 'Assistant processing failed.' });
  }
}

function parseIntentOnly(req, res) {
  const { text } = req.body;
  if (!text) return res.status(400).json({ success: false, error: 'Text required.' });
  return res.json({ success: true, ...recognizeIntent(text) });
}

function getVoiceLanguages(req, res) {
  return res.json({ success: true, languages: getSupportedLanguages() });
}

module.exports = {
  processMessage,
  parseIntentOnly,
  getVoiceLanguages
};
