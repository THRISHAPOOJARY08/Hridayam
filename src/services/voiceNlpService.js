// ROUTELESS Karnataka Voice NLP & Intent Engine
// Supports Kannada, English, Hindi, Telugu, Tamil, and Malayalam

const INTENTS = {
  GREETING: 'GREETING',
  TRANSPORT_SEARCH: 'TRANSPORT_SEARCH',
  FIND_SHARED_RIDE: 'FIND_SHARED_RIDE',
  CHECK_SEAT_AVAILABILITY: 'CHECK_SEAT_AVAILABILITY',
  BOOK_RIDE: 'BOOK_RIDE',
  CANCEL_BOOKING: 'CANCEL_BOOKING',
  CHECK_BOOKING_STATUS: 'CHECK_BOOKING_STATUS',
  FIND_NEARBY_BUS_STOP: 'FIND_NEARBY_BUS_STOP',
  REQUEST_PICKUP: 'REQUEST_PICKUP',
  FIND_ALTERNATIVE_TRANSPORT: 'FIND_ALTERNATIVE_TRANSPORT',
  CHECK_ROUTE_INFORMATION: 'CHECK_ROUTE_INFORMATION',
  HELP: 'HELP',
  UNKNOWN: 'UNKNOWN'
};

const INTENT_PATTERNS = [
  {
    intent: INTENTS.GREETING,
    patterns: [
      /^(hi|hello|hey|namaste|good morning)\b/i,
      /ನಮಸ್ಕಾರ|ಶುಭೋದಯ|ಹಲೋ|ನಮಸ್ತೆ/i,
      /नमस्ते|प्रणाम|नमस्कार/i,
      /வணக்கம்|ஹலோ/i,
      /నమస్కారం|హలో/i,
      /നമസ്കാരം|ഹലോ/i
    ]
  },
  {
    intent: INTENTS.REQUEST_PICKUP,
    patterns: [
      /\b(request pickup|petition stop|new stop|demand stop|stop beku)\b/i,
      /ಸ್ಟಾಪ್ ವಿನಂತಿ|ಹೊಸ ನಿಲ್ದಾಣ|ಪಿಕಪ್ ಬೇಕು|ನಿಲುಗಡೆ ಕೊಡಿ|ಸ್ಟಾಪ್ ಮಾಡಿ/i,
      /स्टॉप अनुरोध|नया स्टॉप|पिकअप चाहिए/i,
      /புதிய நிறுத்தம்|பிக்கப்/i,
      /కొత్త స్టాప్|పికప్ కావాలి/i
    ]
  },
  {
    intent: INTENTS.FIND_NEARBY_BUS_STOP,
    patterns: [
      /\b(nearby bus stop|nearest stop|where is the stop|where to board)\b/i,
      /ಹತ್ತಿರದ ಬಸ್ ನಿಲ್ದಾಣ|ನಿಲ್ದಾಣ ಎಲ್ಲಿದೆ|ಎಲ್ಲಿ ಹತ್ತಬೇಕು|ಹತ್ತಿರದ ಸ್ಟಾಪ್/i,
      /पास का बस स्टॉप|नजदीकी स्टॉप/i,
      /அருகிலுள்ள பஸ் நிறுத்தம்/i,
      /దగ్గరలోని బస్ స్టాప్/i
    ]
  },
  {
    intent: INTENTS.CHECK_BOOKING_STATUS,
    patterns: [
      /\b(booking status|my booking|trip status|my ticket|track ride|active booking)\b/i,
      /ನನ್ನ ಬುಕಿಂಗ್|ಬುಕಿಂಗ್ ಸ್ಥಿತಿ|ಪ್ರಯಾಣ ಸ್ಥಿತಿ|ನನ್ನ ಟಿಕೆಟ್|ಪಾಸ್ ಸ್ಥಿತಿ/i,
      /मेरी बुकिंग|बुकिंग स्थिति|मेरा टिकट/i,
      /எனது முன்பதிவு|பயண நிலை/i,
      /నా బుకింగ్|ప్రయాణ స్థితి/i
    ]
  },
  {
    intent: INTENTS.CANCEL_BOOKING,
    patterns: [
      /\b(cancel booking|cancel my ride|cancel ticket)\b/i,
      /ಬುಕಿಂಗ್ ರದ್ದು|ರದ್ದು ಮಾಡಿ|ಕ್ಯಾನ್ಸಲ್/i,
      /बुकिंग रद्द|रद्द करें/i,
      /முன்பதிவு ரத்து/i,
      /బుకింగ్ రద్దు/i
    ]
  },
  {
    intent: INTENTS.BOOK_RIDE,
    patterns: [
      /\b(book ride|book seat|confirm seat|reserve seat|join pool|board)\b/i,
      /ಸೀಟು ಕಾಯ್ದಿರಿಸಿ|ಕಾಯ್ದಿರಿಸಿ|ಬುಕ್ ಮಾಡಿ|ಹೌದು.*ಕಾಯ್ದಿರಿಸಿ|ಸೀಟ್ ಬೇಕು|ಬೋರ್ಡಿಂಗ್/i,
      /सीट बुक|आरक्षित करें|हाँ.*बुक/i,
      /இருக்கை பதிவு|புக் செய்/i,
      /సీటు బుక్|రిజర్వ్/i
    ]
  },
  {
    intent: INTENTS.CHECK_SEAT_AVAILABILITY,
    patterns: [
      /\b(seats available|how many seats|seat count|any seats|seats left)\b/i,
      /ಎಷ್ಟು ಸೀಟುಗಳು|ಸೀಟು ಲಭ್ಯವಿದೆಯಾ|ಜಾಗ ಇದೆಯಾ|ಸೀಟ್ ಖಾಲಿ ಇದೆಯಾ/i,
      /कितनी सीटें|खाली सीट/i,
      /எத்தனை இருக்கைகள்/i,
      /ఎన్ని సీట్లు/i
    ]
  },
  {
    intent: INTENTS.FIND_SHARED_RIDE,
    patterns: [
      /\b(shared ride|cruiser|carpool|pool|bolero|manjunath)\b/i,
      /ಶೇರ್ಡ್ ಕ್ರೂಸರ್|ಹಂಚಿಕೆಯ ಸವಾರಿ|ಕ್ರೂಸರ್|ಪೂಲ್|ವಿದ್ಯಾರ್ಥಿ ಪೂಲ್/i,
      /साझा सवारी|क्रूजर|पूल/i,
      /பகிர்வு பயணம்|கார்பூல்/i,
      /షేర్డ్ రైడ్|కార్‌పూల్/i
    ]
  },
  {
    intent: INTENTS.FIND_ALTERNATIVE_TRANSPORT,
    patterns: [
      /\b(alternative|backup minibus|exam rush|cancelled|delay|breakdown)\b/i,
      /ಬ್ಯಾಕಪ್ ಮಿನಿಬಸ್|ಪರ್ಯಾಯ|ರದ್ದಾಗಿದೆ|ಪರೀಕ್ಷಾ ರಷ್|ಬದಲಿ ಸಾರಿಗೆ/i,
      /बैकअप बस|वैकल्पिक|रद्द/i,
      /மாற்று வாகனம்/i,
      /ప్రత్యామ్నాయ రవాణా/i
    ]
  },
  {
    intent: INTENTS.TRANSPORT_SEARCH,
    patterns: [
      /\b(find bus|ksrtc bus|bus to|travel to|how to go|bus schedule|haveri college)\b/i,
      /ಬಸ್ ಇದೆಯಾ|ಕಾಲೇಜಿಗೆ ಹೋಗಲು|ಕೆಎಸ್\u200cಆರ್\u200cಟಿಸಿ ಬಸ್|ಸಾರಿಗೆ ಹುಡುಕಿ|ಹಾವೇರಿ ಕಾಲೇಜು/i,
      /बस ढूंढें|कॉलेज जाना है|केएसआरटीसी/i,
      /பேருந்து உள்ளதா|கல்லூரி செல்ல/i,
      /బస్సు ఉందా|కాలేజీకి వెళ్ళాలి/i
    ]
  },
  {
    intent: INTENTS.CHECK_ROUTE_INFORMATION,
    patterns: [
      /\b(route info|distance|travel time|how long|byadgi to haveri)\b/i,
      /ದೂರ ಎಷ್ಟು|ಎಷ್ಟು ಸಮಯ|ಮಾರ್ಗ ಮಾಹಿತಿ|ಬ್ಯಾಡಗಿ ಇಂದ ಹಾವೇರಿ/i,
      /दूरी कितनी है|कितना समय/i,
      /தூரம் எவ்வளவு|பயண நேரம்/i,
      /దూరం ఎంత|సమయం ఎంత/i
    ]
  },
  {
    intent: INTENTS.HELP,
    patterns: [
      /\b(help|assist|what can you do|commands)\b/i,
      /ಸಹಾಯ|ಏನು ಮಾಡಬಹುದು|ಹೇಗೆ ಬಳಸುವುದು/i,
      /मदद|सहायता/i,
      /உதவி/i,
      /సహాయం/i
    ]
  }
];

function extractEntities(text) {
  const entities = {
    origin: null,
    destination: null,
    district: 'Haveri',
    village: null,
    institution: null,
    travel_date: new Date().toISOString().split('T')[0],
    preferred_time: '07:45 AM',
    passenger_count: 1
  };

  const lower = text.toLowerCase();

  if (lower.includes('motebennur') || lower.includes('ಮೊಟೆಬೆನ್ನೂರು')) {
    entities.village = 'Motebennur';
    entities.origin = 'ಮೊಟೆಬೆನ್ನೂರು (Motebennur)';
  } else if (lower.includes('byadgi') || lower.includes('ಬ್ಯಾಡಗಿ')) {
    entities.origin = 'ಬ್ಯಾಡಗಿ ನಿಲ್ದಾಣ (Byadgi Stand)';
  } else if (lower.includes('kaginele') || lower.includes('ಕಾಗಿನೆಲೆ')) {
    entities.origin = 'ಕಾಗಿನೆಲೆ (Kaginele)';
  }

  if (lower.includes('college') || lower.includes('ಕಾಲೇಜು') || lower.includes('haveri') || lower.includes('ಹಾವೇರಿ')) {
    entities.destination = 'ಹಾವೇರಿ ಕಾಲೇಜ್ ಆವರಣ (Govt First Grade College, Haveri)';
    entities.institution = 'Govt First Grade College, Haveri';
  }

  return entities;
}

function recognizeIntent(text) {
  if (!text || typeof text !== 'string') {
    return { intent: INTENTS.UNKNOWN, confidence: 0, entities: {} };
  }

  const clean = text.trim();
  for (const item of INTENT_PATTERNS) {
    for (const pattern of item.patterns) {
      if (pattern.test(clean)) {
        return {
          intent: item.intent,
          confidence: 0.95,
          entities: extractEntities(clean)
        };
      }
    }
  }

  return {
    intent: INTENTS.UNKNOWN,
    confidence: 0.2,
    entities: extractEntities(clean)
  };
}

module.exports = {
  INTENTS,
  recognizeIntent,
  extractEntities
};
