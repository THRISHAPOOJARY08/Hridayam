// ROUTELESS: THE LAST MILE | KARNATAKA
// Comprehensive Client Runtime & Functionality Repair Engine
// Complete Language Management (6 Languages, Instant DOM Translation, No Reload)
// Complete Theme Management (Light, Dark, System Theme, CSS Variables, System Event Listener)
// User Preferences API Integration (GET/PATCH /api/users/me/preferences)
// Real Backend Operations, Concurrency-Safe Bookings, Bus Stop on Demand, and Voice AI.

(function () {
  'use strict';

  const API_BASE = '/api';

  // ---- IST Date/Time Utility (Asia/Kolkata, UTC+5:30) ----
  const IST_TZ = 'Asia/Kolkata';

  window.RoutelessTime = {
    /**
     * Format any date to IST display string
     * e.g. "13 Nov 2026, 1:30 PM"
     */
    toIST: function(input) {
      if (!input) return '—';
      try {
        const d = new Date(input);
        if (isNaN(d.getTime())) return String(input);
        return new Intl.DateTimeFormat('en-IN', {
          timeZone: IST_TZ,
          day: 'numeric', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit', hour12: true
        }).format(d);
      } catch (e) { return String(input); }
    },
    toISTTime: function(input) {
      if (!input) return '—';
      // If already a time string like "07:45 AM", just append IST
      if (typeof input === 'string' && /^\d{1,2}:\d{2}\s*(AM|PM)$/i.test(input.trim())) {
        return input.trim() + ' IST';
      }
      try {
        const d = new Date(input);
        if (isNaN(d.getTime())) return String(input);
        return new Intl.DateTimeFormat('en-IN', {
          timeZone: IST_TZ, hour: '2-digit', minute: '2-digit', hour12: true
        }).format(d) + ' IST';
      } catch (e) { return String(input); }
    },
    toISTDate: function(input) {
      if (!input) return '—';
      try {
        const d = new Date(input);
        if (isNaN(d.getTime())) return String(input);
        return new Intl.DateTimeFormat('en-IN', {
          timeZone: IST_TZ, day: 'numeric', month: 'short', year: 'numeric'
        }).format(d);
      } catch (e) { return String(input); }
    },
    nowIST: function() {
      return new Intl.DateTimeFormat('en-IN', {
        timeZone: IST_TZ,
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
      }).format(new Date());
    }
  };


  // 1. Comprehensive Multilingual Dictionary for Karnataka Frontend
  const TRANSLATIONS = {
    kn: {
      app_title: 'ರೂಟ್‌ಲೆಸ್ ಕರ್ನಾಟಕ',
      greeting: 'ನಮಸ್ಕಾರ, Sahana!',
      district_label: 'ಹಾವೇರಿ ಜಿಲ್ಲೆ',
      todays_travel: 'ಇಂದಿನ ಪ್ರಯಾಣ',
      quick_services: 'ತ್ವರಿತ ಸೇವೆಗಳು',
      find_transit: 'ಸಾರಿಗೆ ಹುಡುಕಿ',
      find_transit_sub: 'ಗ್ರಾಮೀಣ ವೇಳಾಪಟ್ಟಿ',
      stop_petition: 'ಸ್ಟಾಪ್ ವಿನಂತಿ',
      stop_petition_sub: 'ಹೊಸ ಪಿಕಪ್ ಪಾಯಿಂಟ್',
      cruiser_pool: 'ವಿದ್ಯಾರ್ಥಿ ಪೂಲ್',
      cruiser_pool_sub: 'ಶೇರ್ಡ್ ಕ್ರೂಸರ್',
      voice_assistant: 'AI ಸಹಾಯಕ',
      voice_assistant_sub: 'ಧ್ವನಿ ಮೂಲಕ ಹುಡುಕಿ',
      student_pass: 'ವಿದ್ಯಾರ್ಥಿ ಡಿಜಿಟಲ್ ಪಾಸ್',
      nav_home: 'ಮನೆ',
      nav_find: 'ಹುಡುಕಿ',
      nav_ai: 'AI ಸಹಾಯಕ',
      nav_bookings: 'ಬುಕಿಂಗ್',
      nav_profile: 'ಪ್ರೊಫೈಲ್',
      mode_all: 'ಎಲ್ಲಾ ಸಾರಿಗೆ',
      mode_ksrtc: 'KSRTC ಬಸ್',
      mode_shared: 'ಶೇರ್ಡ್ ಕ್ರೂಸರ್',
      mode_van: 'ಬ್ಯಾಕಪ್ ಮಿನಿಬಸ್',
      select_board: 'ಸೀಟ್ ಕಾಯ್ದಿರಿಸಿ & ಬೋರ್ಡಿಂಗ್',
      join_pool: 'ರೈಡ್ ಸೇರಿ',
      reserve_van: 'ಕಾಯ್ದಿರಿಸಿ',
      lang_selection: 'ಭಾಷಾ ಆಯ್ಕೆ',
      theme_mode: 'ವಿನ್ಯಾಸ ಮೋಡ್',
      theme_dark: 'ಡಾರ್ಕ್ ಮೋಡ್',
      theme_light: 'ಲೈಟ್ ಮೋಡ್',
      theme_system: 'ಸಿಸ್ಟಮ್',
      travel_services: 'ಪ್ರಯಾಣ ಹಾಗೂ ಸೌಲಭ್ಯಗಳು',
      safety_support: 'ಸುರಕ್ಷತೆ ಮತ್ತು ಬೆಂಬಲ',
      active_rides: 'ಸಕ್ರಿಯ ಪ್ರಯಾಣ (2)',
      pass_tab: 'ವಿದ್ಯಾರ್ಥಿ ಪಾಸ್',
      history_tab: 'ಹಿಂದಿನ ಇತಿಹಾಸ',
      change_btn: 'ಬದಲಾಯಿಸಿ',
      edit_profile: 'ತಿದ್ದುಪಡಿ',
      duration_label: 'ಪ್ರಯಾಣಾವಧಿ',
      seats_left_14: '14 ಸೀಟುಗಳು ಲಭ್ಯ',
      seats_left_3: '3 ಸೀಟು ಬಾಕಿ',
      seats_left_8: '8 ಸೀಟುಗಳು ಲಭ್ಯ',
      pass_free: 'ವಿದ್ಯಾರ್ಥಿ ಪಾಸ್ ಮಾನ್ಯ (ಉಚಿತ)',
      flat_fare: 'ನಿಗದಿತ ಶುಲ್ಕ ₹15',
      subsidized_fare: 'ರಿಯಾಯಿತಿ ದರ ₹10',
      direct_bus: 'ನೇರ ಬಸ್ • Direct',
      fast_route: 'ವೇಗದ ಮಾರ್ಗ • 8 ನಿಮಿಷ ವೇಗ',
      exam_fallback: 'ಪರೀಕ್ಷಾ ರಷ್ ಬ್ಯಾಕಪ್ • FALLBACK',
      cancel_ride: 'ಬುಕಿಂಗ್ ರದ್ದು ಮಾಡಿ'
    },
    en: {
      app_title: 'ROUTELESS KARNATAKA',
      greeting: 'Hello, Sahana!',
      district_label: 'Haveri District',
      todays_travel: "Today's Travel",
      quick_services: 'Quick Services',
      find_transit: 'Find Transport',
      find_transit_sub: 'Rural Schedules & Routes',
      stop_petition: 'Bus Stop on Demand',
      stop_petition_sub: 'Petition New Pickup',
      cruiser_pool: 'Student Cruiser Pool',
      cruiser_pool_sub: 'Shared Student Pool',
      voice_assistant: 'AI Assistant',
      voice_assistant_sub: 'Ask via Voice or Text',
      student_pass: 'Student Digital Pass',
      nav_home: 'Home',
      nav_find: 'Find',
      nav_ai: 'AI Assistant',
      nav_bookings: 'Bookings',
      nav_profile: 'Profile',
      mode_all: 'All Modes',
      mode_ksrtc: 'KSRTC Bus',
      mode_shared: 'Shared Cruiser',
      mode_van: 'Backup Minibus',
      select_board: 'Select & Board',
      join_pool: 'Join Pool',
      reserve_van: 'Reserve Seat',
      lang_selection: 'Language Selection',
      theme_mode: 'Theme Mode',
      theme_dark: 'Dark Mode',
      theme_light: 'Light Mode',
      theme_system: 'System Mode',
      travel_services: 'Travel & Services',
      safety_support: 'Safety & Support',
      active_rides: 'Active Rides (2)',
      pass_tab: 'Student Pass',
      history_tab: 'Trip History',
      change_btn: 'Change',
      edit_profile: 'Edit Profile',
      duration_label: 'Duration',
      seats_left_14: '14 Seats Available',
      seats_left_3: '3 Seats Open',
      seats_left_8: '8 Seats Available',
      pass_free: 'Free with Student Pass',
      flat_fare: 'Flat Fare ₹15',
      subsidized_fare: 'Subsidized ₹10',
      direct_bus: 'Direct Bus',
      fast_route: 'Fast Route • 8 mins faster',
      exam_fallback: 'Exam Rush Fallback',
      cancel_ride: 'Cancel Booking'
    },
    hi: {
      app_title: 'रूटलेस कर्नाटक',
      greeting: 'नमस्ते, Sahana!',
      district_label: 'हावेरी जिला',
      todays_travel: 'आज की यात्रा',
      quick_services: 'त्वरित सेवाएं',
      find_transit: 'परिवहन खोजें',
      find_transit_sub: 'ग्रामीण समय सारिणी',
      stop_petition: 'स्टॉप अनुरोध',
      stop_petition_sub: 'नया स्टॉप आवेदन',
      cruiser_pool: 'छात्र क्रूजर पूल',
      cruiser_pool_sub: 'साझा छात्र सवारी',
      voice_assistant: 'AI सहायक',
      voice_assistant_sub: 'आवाज से पूछें',
      student_pass: 'छात्र डिजिटल पास',
      nav_home: 'होम',
      nav_find: 'खोजें',
      nav_ai: 'AI सहायक',
      nav_bookings: 'बुकिंग',
      nav_profile: 'प्रोफ़ाइल',
      mode_all: 'सभी साधन',
      mode_ksrtc: 'KSRTC बस',
      mode_shared: 'साझा क्रूजर',
      mode_van: 'बैकअप मिनीबस',
      select_board: 'सीट चुनें और बोर्ड करें',
      join_pool: 'सवारी में जुड़ें',
      reserve_van: 'सीट आरक्षित करें',
      lang_selection: 'भाषा चयन',
      theme_mode: 'थीम मोड',
      theme_dark: 'डार्क मोड',
      theme_light: 'लाइट मोड',
      theme_system: 'सिस्टम मोड',
      travel_services: 'यात्रा और सुविधाएं',
      safety_support: 'सुरक्षा और सहायता',
      active_rides: 'सक्रिय यात्राएं (2)',
      pass_tab: 'छात्र पास',
      history_tab: 'पिछला इतिहास',
      change_btn: 'बदलें',
      edit_profile: 'संपादित करें',
      duration_label: 'यात्रा समय',
      seats_left_14: '14 सीटें उपलब्ध',
      seats_left_3: '3 सीटें खाली',
      seats_left_8: '8 सीटें उपलब्ध',
      pass_free: 'छात्र पास के साथ मुफ़्त',
      flat_fare: 'किराया ₹15',
      subsidized_fare: 'रियायती दर ₹10',
      direct_bus: 'सीधी बस',
      fast_route: 'तेज मार्ग • 8 मिनट तेज',
      exam_fallback: 'परीक्षा बैकअप',
      cancel_ride: 'बुकिंग रद्द करें'
    },
    te: {
      app_title: 'రూట్‌లెస్ కర్ణాటక',
      greeting: 'నమస్కారం, Sahana!',
      district_label: 'హావేరి జిల్లా',
      todays_travel: 'నేటి ప్రయాణం',
      quick_services: 'త్వరిత సేవలు',
      find_transit: 'రవాణా వెతకండి',
      find_transit_sub: 'గ్రామీణ వేళలు',
      stop_petition: 'స్టాప్ అభ్యర్థన',
      stop_petition_sub: 'కొత్త పికప్ స్టాప్',
      cruiser_pool: 'విద్యార్థి క్రూజర్ పూల్',
      cruiser_pool_sub: 'షేర్డ్ పూల్',
      voice_assistant: 'AI సహాయకుడు',
      voice_assistant_sub: 'వాయిస్ అసిస్టెంట్',
      student_pass: 'విద్యార్థి డిజిటల్ పాస్',
      nav_home: 'హోమ్',
      nav_find: 'వెతకండి',
      nav_ai: 'AI సహాయకుడు',
      nav_bookings: 'బుకింగ్స్',
      nav_profile: 'ప్రొఫైల్',
      mode_all: 'అన్ని రవాణా',
      mode_ksrtc: 'KSRTC బస్సు',
      mode_shared: 'షేర్డ్ క్రూజర్',
      mode_van: 'బ్యాకప్ మినీబస్సు',
      select_board: 'సీటు రిజర్వ్ & బోర్డింగ్',
      join_pool: 'రైడ్‌లో చేరండి',
      reserve_van: 'రిజర్వ్ చేయండి',
      lang_selection: 'భాష ఎంపిక',
      theme_mode: 'థీమ్ మోడ్',
      theme_dark: 'డార్క్ మోడ్',
      theme_light: 'లైట్ మోడ్',
      theme_system: 'సిస్టమ్ మోడ్',
      travel_services: 'ప్రయాణ సేవలు',
      safety_support: 'భద్రత & మద్దతు',
      active_rides: 'సక్రియ ప్రయాణాలు (2)',
      pass_tab: 'విద్యార్థి పాస్',
      history_tab: 'చరిత్ర',
      change_btn: 'మార్చండి',
      edit_profile: 'సవరించండి',
      duration_label: 'సమయం',
      seats_left_14: '14 సీట్లు ఉన్నాయి',
      seats_left_3: '3 సీట్లు ఖాళీ',
      seats_left_8: '8 సీట్లు ఉన్నాయి',
      pass_free: 'పాస్‌తో ఉచితం',
      flat_fare: 'ఛార్జీ ₹15',
      subsidized_fare: 'రాయితీ ₹10',
      direct_bus: 'నేరుగా బస్సు',
      fast_route: 'వేగవంతమైన రూట్',
      exam_fallback: 'పరీక్ష బ్యాకప్',
      cancel_ride: 'రద్దు చేయండి'
    },
    ta: {
      app_title: 'ரூட்லெஸ் கர்நாடகா',
      greeting: 'வணக்கம், Sahana!',
      district_label: 'ஹாவேரி மாவட்டம்',
      todays_travel: 'இன்றைய பயணம்',
      quick_services: 'விரைவு சேவைகள்',
      find_transit: 'பேருந்து தேடு',
      find_transit_sub: 'கிராமப்புற அட்டவணை',
      stop_petition: 'நிறுத்தம் கோரிக்கை',
      stop_petition_sub: 'புதிய பிக்கப் பாயிண்ட்',
      cruiser_pool: 'மாணவர் குரூசர் பூல்',
      cruiser_pool_sub: 'பகிர்வு பயணம்',
      voice_assistant: 'AI உதவியாளர்',
      voice_assistant_sub: 'குரல் மூலம் தேடு',
      student_pass: 'மாணவர் டிஜிட்டல் பாஸ்',
      nav_home: 'முகப்பு',
      nav_find: 'தேடு',
      nav_ai: 'AI உதவியாளர்',
      nav_bookings: 'முன்பதிவு',
      nav_profile: 'சுயவிவரம்',
      mode_all: 'அனைத்து முறைகள்',
      mode_ksrtc: 'KSRTC பேருந்து',
      mode_shared: 'பகிர்வு குரூசர்',
      mode_van: 'பேக்கப் மினிபஸ்',
      select_board: 'இருக்கை & போர்டிங்',
      join_pool: 'பூலில் இணையுங்கள்',
      reserve_van: 'முன்பதிவு செய்',
      lang_selection: 'மொழி தேர்வு',
      theme_mode: 'தீம் முறை',
      theme_dark: 'டார்க் மோட்',
      theme_light: 'லைட் மோட்',
      theme_system: 'சிஸ்டம் முறை',
      travel_services: 'பயணம் மற்றும் சேவைகள்',
      safety_support: 'பாதுகாப்பு & உதவி',
      active_rides: 'செயலில் உள்ளவை (2)',
      pass_tab: 'மாணவர் பாஸ்',
      history_tab: 'பயண வரலாறு',
      change_btn: 'மாற்று',
      edit_profile: 'திருத்து',
      duration_label: 'பயண நேரம்',
      seats_left_14: '14 இருக்கைகள் உள்ளன',
      seats_left_3: '3 இருக்கைகள் உள்ளன',
      seats_left_8: '8 இருக்கைகள் உள்ளன',
      pass_free: 'பாஸ் மூலம் இலவசம்',
      flat_fare: 'கட்டணம் ₹15',
      subsidized_fare: 'மானியம் ₹10',
      direct_bus: 'நேரடி பேருந்து',
      fast_route: 'வேகமான பாதை',
      exam_fallback: 'தேர்வு பேக்கப்',
      cancel_ride: 'முன்பதிவு ரத்து'
    },
    ml: {
      app_title: 'റൂട്ട്‌ലെസ് കർണാടക',
      greeting: 'നമസ്കാരം, Sahana!',
      district_label: 'ഹാവേരി ജില്ല',
      todays_travel: 'ഇന്നത്തെ യാത്ര',
      quick_services: 'ദ്രുത സേവനങ്ങൾ',
      find_transit: 'യാത്രാ സൗകര്യം',
      find_transit_sub: 'ഗ്രാമീണ ഷെഡ്യൂൾ',
      stop_petition: 'സ്റ്റോപ്പ് ആവശ്യം',
      stop_petition_sub: 'പുതിയ പിക്കപ്പ് പോയിൻ്റ്',
      cruiser_pool: 'സ്റ്റുഡൻ്റ് ക്രൂയിസർ പൂൾ',
      cruiser_pool_sub: 'ഷെയർഡ് പൂൾ',
      voice_assistant: 'AI സഹായി',
      voice_assistant_sub: 'ശബ്ദത്തിലൂടെ ചോദിക്കൂ',
      student_pass: 'സ്റ്റുഡൻ്റ് ഡിജിറ്റൽ പാസ്',
      nav_home: 'ഹോം',
      nav_find: 'തിരയുക',
      nav_ai: 'AI സഹായി',
      nav_bookings: 'ബുക്കിംഗ്',
      nav_profile: 'പ്രൊഫൈൽ',
      mode_all: 'എല്ലാ രീതികളും',
      mode_ksrtc: 'KSRTC ബസ്',
      mode_shared: 'ഷെയർഡ് ക്രൂയിസർ',
      mode_van: 'ബാക്കപ്പ് മിനിബസ്',
      select_board: 'സീറ്റ് & ബോർഡിംഗ്',
      join_pool: 'യാത്രയിൽ ചേരുക',
      reserve_van: 'റിസർവ് ചെയ്യുക',
      lang_selection: 'ഭാഷാ തിരഞ്ഞെടുപ്പ്',
      theme_mode: 'തീം മോഡ്',
      theme_dark: 'ഡാർക്ക് മോഡ്',
      theme_light: 'ലൈറ്റ് മോഡ്',
      theme_system: 'സിസ്റ്റം മോഡ്',
      travel_services: 'യാത്രാ സൗകര്യങ്ങൾ',
      safety_support: 'സുരക്ഷയും സഹായവും',
      active_rides: 'സജീവ യാത്രകൾ (2)',
      pass_tab: 'സ്റ്റുഡൻ്റ് പാസ്',
      history_tab: 'യാത്രാ ചരിത്രം',
      change_btn: 'മാറ്റുക',
      edit_profile: 'എഡിറ്റ് ചെയ്യുക',
      duration_label: 'യാത്രാ സമയം',
      seats_left_14: '14 സീറ്റുകൾ ബാക്കി',
      seats_left_3: '3 സീറ്റുകൾ ബാക്കി',
      seats_left_8: '8 സീറ്റുകൾ ബാക്കി',
      pass_free: 'പാസ് ഉപയോഗിച്ച് സൗജന്യം',
      flat_fare: 'നിരക്ക് ₹15',
      subsidized_fare: 'സബ്സിഡി ₹10',
      direct_bus: 'നേരിട്ടുള്ള ബസ്',
      fast_route: 'വേഗതയേറിയ റൂട്ട്',
      exam_fallback: 'പരീക്ഷാ ബാക്കപ്പ്',
      cancel_ride: 'ബുക്കിംഗ് റദ്ദാക്കുക'
    }
  };

  // State Management
  window.KarnatakaState = {
    language: localStorage.getItem('routeless_lang') || 'kn',
    theme: localStorage.getItem('routeless_theme') || 'light',
    district: localStorage.getItem('routeless_district') || 'Haveri',
    user: JSON.parse(localStorage.getItem('routeless_user') || 'null') || {
      id: 1,
      full_name: 'Sahana Gowda',
      email: 'sahana@routeless.ai',
      role: 'student'
    }
  };

  // Centralized Fetch with Graceful Offline Recovery
  window.karnatakaFetch = async function (url, options = {}) {
    options.headers = options.headers || {};
    options.headers['Content-Type'] = options.headers['Content-Type'] || 'application/json';
    options.headers['Accept-Language'] = window.KarnatakaState.language;
    const token = localStorage.getItem('routeless_token');
    if (token) options.headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(url, options);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      return data;
    } catch (err) {
      console.warn('Network operation handled:', err.message);
      throw err;
    }
  };

  // 2. Synchronize User Preferences with Backend (Phase 5)
  async function syncPreferencesOnStartup() {
    try {
      const res = await window.karnatakaFetch(`${API_BASE}/users/me/preferences`);
      if (res.success) {
        if (res.language && ['kn', 'en', 'hi', 'te', 'ta', 'ml'].includes(res.language)) {
          window.KarnatakaState.language = res.language;
          localStorage.setItem('routeless_lang', res.language);
        }
        if (res.theme && ['light', 'dark', 'system'].includes(res.theme)) {
          window.KarnatakaState.theme = res.theme;
          localStorage.setItem('routeless_theme', res.theme);
        }
      }
    } catch (e) {
      // Local fallback active
    }

    // Apply synchronized settings
    applyTheme(window.KarnatakaState.theme);
    applyTranslations(window.KarnatakaState.language);
  }

  // 3. Centralized Language Switching Engine (Phase 3)
  window.setLanguage = async function (langCode) {
    if (!TRANSLATIONS[langCode]) langCode = 'en';

    window.KarnatakaState.language = langCode;
    localStorage.setItem('routeless_lang', langCode);

    // Immediately translate entire DOM without reload
    applyTranslations(langCode);

    // Update active highlight on settings buttons
    updateLanguageButtonsVisuals(langCode);

    // Synchronize to backend
    try {
      await window.karnatakaFetch(`${API_BASE}/users/me/preferences`, {
        method: 'PATCH',
        body: JSON.stringify({ language: langCode })
      });
    } catch (e) {
      // Retain local state
    }

    showToast(`Language: ${langCode.toUpperCase()}`);
  };

  function applyTranslations(lang) {
    const t = TRANSLATIONS[lang] || TRANSLATIONS['en'];

    // 1. Navigation items
    const navItems = [
      { sel: '[data-path="home"]', text: t.nav_home },
      { sel: '[data-path="find-transport"]', text: t.nav_find },
      { sel: '[data-path="my-bookings"]', text: t.nav_bookings },
      { sel: '[data-path="profile"]', text: t.nav_profile }
    ];

    navItems.forEach(n => {
      document.querySelectorAll(n.sel).forEach(el => {
        const span = el.querySelector('span:not(.material-symbols-outlined)') || el;
        if (span && span !== el) span.textContent = n.text;
      });
    });

    // Center floating mic label
    document.querySelectorAll('.font-label-sm').forEach(el => {
      if (el.textContent.includes('AI Assistant') || el.textContent.includes('AI ಸಹಾಯಕ')) {
        el.textContent = t.nav_ai;
      }
    });

    // 2. Greeting Headline
    document.querySelectorAll('h1').forEach(h => {
      if (h.textContent.includes('Sahana') || h.textContent.includes('ನಮಸ್ಕಾರ') || h.textContent.includes('Hello')) {
        h.textContent = t.greeting;
      }
    });

    // 3. Section Titles (h2, h3, h4)
    document.querySelectorAll('h2, h3, h4').forEach(el => {
      const txt = el.textContent.trim();
      if (txt.includes('ಇಂದಿನ ಪ್ರಯಾಣ') || txt.includes("Today's Travel")) el.textContent = t.todays_travel;
      else if (txt.includes('ತ್ವರಿತ ಸೇವೆಗಳು') || txt.includes('Quick Services')) el.textContent = t.quick_services;
      else if (txt.includes('ವಿದ್ಯಾರ್ಥಿ ಡಿಜಿಟಲ್ ಪಾಸ್') || txt.includes('Student Digital Pass')) el.textContent = t.student_pass;
      else if (txt.includes('ಭಾಷಾ ಆಯ್ಕೆ') || txt.includes('Language Selection')) el.textContent = t.lang_selection;
      else if (txt.includes('ವಿನ್ಯಾಸ ಮೋಡ್') || txt.includes('Theme Mode')) el.textContent = t.theme_mode;
      else if (txt.includes('ಪ್ರಯಾಣ ಹಾಗೂ ಸೌಲಭ್ಯಗಳು') || txt.includes('Travel & Services')) el.textContent = t.travel_services;
      else if (txt.includes('ಸುರಕ್ಷತೆ ಮತ್ತು ಬೆಂಬಲ') || txt.includes('Safety & Support')) el.textContent = t.safety_support;
      else if (txt.includes('ಹಿಂದಿನ ಪ್ರಯಾಣಗಳ ಇತಿಹಾಸ') || txt.includes('History')) el.textContent = t.history_tab;
      else if (txt.includes('ವಿದ್ಯಾರ್ಥಿ ರಿಯಾಯಿತಿ ಪಾಸ್') || txt.includes('Pass')) el.textContent = t.pass_tab;
    });

    // 4. Quick Services Card Subtitles & Titles
    document.querySelectorAll('.rounded-2xl, .rounded-xl').forEach(card => {
      const textNodes = card.querySelectorAll('p, div, span');
      textNodes.forEach(node => {
        const c = node.textContent.trim();
        if (c.includes('ಸಾರಿಗೆ ಹುಡುಕಿ') || c.includes('Find Transport')) node.textContent = t.find_transit;
        else if (c.includes('ಸ್ಟಾಪ್ ವಿನಂತಿ') || c.includes('Bus Stop on Demand')) node.textContent = t.stop_petition;
        else if (c.includes('ವಿದ್ಯಾರ್ಥಿ ಪೂಲ್') || c.includes('Shared Cruiser Pool')) node.textContent = t.cruiser_pool;
        else if (c.includes('AI ಸಹಾಯಕ') && !node.closest('nav')) node.textContent = t.voice_assistant;
      });
    });

    // 5. Filter Pills on Find Transport page
    document.querySelectorAll('.filter-pill').forEach(pill => {
      const mode = pill.getAttribute('data-mode');
      const textSpan = pill.querySelector('span:not(.material-symbols-outlined)') || pill;
      if (mode === 'all') textSpan.textContent = t.mode_all;
      else if (mode === 'ksrtc') textSpan.textContent = t.mode_ksrtc;
      else if (mode === 'shared') textSpan.textContent = t.mode_shared;
      else if (mode === 'van') textSpan.textContent = t.mode_van;
    });

    // 6. Action Buttons on Transport Cards
    document.querySelectorAll('button').forEach(btn => {
      const bTxt = btn.textContent.trim();
      if (bTxt.includes('Select & Board') || bTxt.includes('ಸೀಟ್ ಕಾಯ್ದಿರಿಸಿ & ಬೋರ್ಡಿಂಗ್')) {
        btn.innerHTML = `<span class="material-symbols-outlined text-[18px]">how_to_reg</span> <span>${t.select_board}</span>`;
      } else if (bTxt.includes('Join') || bTxt.includes('ರೈಡ್ ಸೇರಿ')) {
        btn.innerHTML = `<span class="material-symbols-outlined text-[18px]">group_add</span> <span>${t.join_pool}</span>`;
      } else if (bTxt.includes('Reserve') || bTxt.includes('ಕಾಯ್ದಿರಿಸಿ')) {
        if (!btn.closest('header')) {
          btn.innerHTML = `<span class="material-symbols-outlined text-[18px]">bookmark_added</span> <span>${t.reserve_van}</span>`;
        }
      } else if (bTxt.includes('Change') || bTxt.includes('ಬದಲಾಯಿಸಿ')) {
        btn.textContent = t.change_btn;
      }
    });

    // 7. Booking Tabs on My Bookings page
    const tabActive = document.getElementById('tab-btn-active');
    if (tabActive) tabActive.textContent = t.active_rides;
    const tabPass = document.getElementById('tab-btn-pass');
    if (tabPass) tabPass.textContent = t.pass_tab;
    const tabHistory = document.getElementById('tab-btn-history');
    if (tabHistory) tabHistory.textContent = t.history_tab;
  }

  function updateLanguageButtonsVisuals(activeLang) {
    const langMap = {
      'kn': 'ಕನ್ನಡ',
      'en': 'English',
      'hi': 'हिन्दी',
      'te': 'తెలుగు',
      'ta': 'தமிழ்',
      'ml': 'മലയാളം'
    };

    document.querySelectorAll('.lang-btn').forEach(btn => {
      const match = langMap[activeLang];
      const isSelected = btn.textContent.includes(match);

      if (isSelected) {
        btn.classList.add('bg-primary-container', 'text-on-primary', 'active', 'shadow-sm');
        btn.classList.remove('bg-surface-container', 'text-on-surface');
        const check = btn.querySelector('.material-symbols-outlined');
        if (check) {
          check.className = 'material-symbols-outlined text-secondary-fixed text-[22px]';
          check.classList.remove('hidden');
        }
      } else {
        btn.classList.remove('bg-primary-container', 'text-on-primary', 'active', 'shadow-sm');
        btn.classList.add('bg-surface-container', 'text-on-surface');
        const check = btn.querySelector('.material-symbols-outlined');
        if (check) {
          check.className = 'material-symbols-outlined text-outline-variant text-[20px] check-icon hidden';
        }
      }
    });
  }

  // 4. Centralized Theme Management Engine (Phase 4)
  window.setTheme = async function (themeKey) {
    if (!['light', 'dark', 'system'].includes(themeKey)) themeKey = 'light';

    window.KarnatakaState.theme = themeKey;
    localStorage.setItem('routeless_theme', themeKey);

    // Apply theme immediately to DOM
    applyTheme(themeKey);

    // Update visuals on settings buttons
    updateThemeButtonsVisuals(themeKey);

    // Save to backend
    try {
      await window.karnatakaFetch(`${API_BASE}/users/me/preferences`, {
        method: 'PATCH',
        body: JSON.stringify({ theme: themeKey })
      });
    } catch (e) {
      // Local persistence intact
    }

    showToast(`Theme: ${themeKey.toUpperCase()}`);
  };

  function applyTheme(themeKey) {
    const root = document.documentElement;

    if (themeKey === 'dark') {
      root.classList.add('dark');
    } else if (themeKey === 'light') {
      root.classList.remove('dark');
    } else {
      // System Mode
      const isSystemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isSystemDark) root.classList.add('dark');
      else root.classList.remove('dark');
    }
  }

  function updateThemeButtonsVisuals(activeTheme) {
    document.querySelectorAll('.theme-btn').forEach(btn => {
      const text = btn.textContent.toLowerCase();
      let matches = false;
      if (activeTheme === 'dark' && (text.includes('ಡಾರ್ಕ್') || text.includes('dark'))) matches = true;
      else if (activeTheme === 'light' && (text.includes('ಲೈಟ್') || text.includes('light'))) matches = true;
      else if (activeTheme === 'system' && (text.includes('ಸಿಸ್ಟಮ್') || text.includes('system'))) matches = true;

      if (matches) {
        btn.classList.add('bg-surface-container-lowest', 'text-primary', 'shadow-sm', 'active');
        btn.classList.remove('text-on-surface-variant');
      } else {
        btn.classList.remove('bg-surface-container-lowest', 'text-primary', 'shadow-sm', 'active');
        btn.classList.add('text-on-surface-variant');
      }
    });
  }

  // Listen to OS System Theme changes when in 'system' mode
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (window.KarnatakaState.theme === 'system') {
        if (e.matches) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
      }
    });
  }

  // 5. Connect Navigation & Global Buttons
  function initNavigation() {
    const PATH_MAP = {
      'home': '/',
      'find-transport': '/find-transport',
      'my-bookings': '/my-bookings',
      'profile': '/profile',
      'student-pass': '/student-pass',
      'ai-chat': '/ai-chat',
      'emergency': '/emergency',
      'admin': '/admin',
      'login': '/login',
      'register': '/register'
    };

    document.querySelectorAll('[data-path]').forEach(el => {
      el.addEventListener('click', (e) => {
        const pathKey = el.getAttribute('data-path');
        if (PATH_MAP[pathKey]) {
          e.preventDefault();
          window.location.href = PATH_MAP[pathKey];
        }
      });
    });

    // Top bar language toggle pill: "translate ಕನ್ನಡ/EN"
    const topLangBtn = Array.from(document.querySelectorAll('button')).find(b =>
      b.textContent.includes('ಕನ್ನಡ/EN') || b.textContent.includes('translate')
    );
    if (topLangBtn) {
      topLangBtn.addEventListener('click', () => {
        const next = window.KarnatakaState.language === 'kn' ? 'en' : 'kn';
        window.setLanguage(next);
      });
    }

    // Top bar district button — specifically the location button in the header
    // Match only <button> inside <header> that has location_on icon, to avoid false positives
    const distBtn = document.querySelector('header button[aria-label*="Location"], header button[aria-label*="District"]')
      || Array.from(document.querySelectorAll('header button')).find(b => {
           const icon = b.querySelector('.material-symbols-outlined');
           return icon && (icon.textContent.trim() === 'location_on' || icon.textContent.trim() === 'map');
         });
    if (distBtn) {
      distBtn.style.cursor = 'pointer';
      distBtn.addEventListener('click', (e) => { e.stopPropagation(); openDistrictModal(); });
    }

    // Floating aside AI Assistant button — match ONLY the <button> inside <aside>, not wrappers
    // Use aria-label for precision to avoid matching any container that holds "AI Assistant" text
    const floatingMic = document.querySelector(
      'aside button[aria-label*="AI"], aside button[aria-label*="Voice"], aside button[aria-label*="ಧ್ವನಿ"]'
    ) || document.querySelector('aside button');
    if (floatingMic) {
      floatingMic.style.cursor = 'pointer';
      floatingMic.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        openVoiceAssistantModal();
      });
    }

    // Connect Quick Service cards on Home page
    // CRITICAL: only match direct text content of the ELEMENT ITSELF, not descendants
    // Use direct child text nodes to avoid matching parent containers
    document.querySelectorAll('button').forEach(el => {
      // Get only the text from direct text nodes (not from child elements) to avoid false positives
      const directText = Array.from(el.childNodes)
        .filter(n => n.nodeType === Node.TEXT_NODE)
        .map(n => n.textContent.trim())
        .join('');
      // Also check span direct children text
      const spanTexts = Array.from(el.querySelectorAll(':scope > span, :scope > div > span'))
        .map(s => s.textContent.trim())
        .join(' ');
      const text = (directText + ' ' + spanTexts).trim();

      // Only match Quick Service grid buttons — they have specific Kannada/English labels
      if ((text.includes('ಸಾರಿಗೆ ಹುಡುಕಿ') || (text.includes('Find Transport') && !text.includes('Find') || text === 'Find Transport'))
          && el.closest('section')) {
        el.addEventListener('click', (e) => {
          if (window.location.pathname !== '/find-transport') {
            e.preventDefault();
            window.location.href = '/find-transport';
          }
        });
      } else if ((text.includes('ಸ್ಟಾಪ್ ವಿನಂತಿ') || text.includes('Bus Stop on Demand') || text.includes('Stop on Demand') || text.includes('ನಿಲುಗಡೆ ವಿನಂತಿ'))
                 && el.closest('section')) {
        el.addEventListener('click', (e) => {
          e.preventDefault();
          openStopOnDemandModal();
        });
      } else if ((text.includes('ವಿದ್ಯಾರ್ಥಿ ಪೂಲ್') || text.includes('Cruiser Pool') || text.includes('ರೈಡ್ ಶೇರ್'))
                 && el.closest('section')) {
        el.addEventListener('click', (e) => {
          e.preventDefault();
          window.location.href = '/find-transport?mode=shared';
        });
      } else if ((text.includes('AI ಧ್ವನಿ ಸಹಾಯಕ') || text.includes('AI Assistant') || text.includes('ಧ್ವನಿ ಸಹಾಯಕ'))
                 && el.closest('section') && !el.closest('nav') && !el.closest('aside')) {
        // Quick service card AI button (grid card, not floating aside button)
        el.addEventListener('click', (e) => {
          e.preventDefault();
          openVoiceAssistantModal();
        });
      }
    });

    // Connect Settings page language buttons
    const langBtnMap = {
      'ಕನ್ನಡ': 'kn',
      'English': 'en',
      'हिन्दी': 'hi',
      'తెలుగు': 'te',
      'தமிழ்': 'ta',
      'മലയാളം': 'ml'
    };

    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.textContent.trim();
        for (const [key, code] of Object.entries(langBtnMap)) {
          if (text.includes(key)) {
            window.setLanguage(code);
            break;
          }
        }
      });
    });

    // Connect Settings page theme buttons
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.textContent.toLowerCase();
        if (text.includes('ಡಾರ್ಕ್') || text.includes('dark')) window.setTheme('dark');
        else if (text.includes('ಸಿಸ್ಟಮ್') || text.includes('system')) window.setTheme('system');
        else window.setTheme('light');
      });
    });
  }

  // 6. Connect Booking & Cancellation Operations
  function initBookingOperations() {
    // Select & Board (KSRTC Express #32)
    const boardBtn = Array.from(document.querySelectorAll('button')).find(b =>
      b.textContent.includes('Select & Board') || b.textContent.includes('ಸೀಟ್ ಕಾಯ್ದಿರಿಸಿ & ಬೋರ್ಡಿಂಗ್')
    );
    if (boardBtn) {
      boardBtn.addEventListener('click', async () => {
        try {
          const res = await window.karnatakaFetch(`${API_BASE}/rides/1/book`, {
            method: 'POST',
            body: JSON.stringify({ seats_requested: 1, pickup_stop: 'ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ 2B, ಬ್ಯಾಡಗಿ ನಿಲ್ದಾಣ' })
          });
          showToast(`✅ ${res.message} (Free with Student Pass)`);
          boardBtn.disabled = true;
          boardBtn.innerHTML = `<span class="material-symbols-outlined text-[18px]">verified</span> ಸೀಟ್ ದೃಢಪಟ್ಟಿದೆ (Boarded)`;
        } catch (e) {
          showToast(`Error: ${e.message}`);
        }
      });
    }

    // Join Pool (Shared Cruiser)
    const joinPoolBtn = Array.from(document.querySelectorAll('button')).find(b =>
      b.textContent.includes('Join') || b.textContent.includes('ರೈಡ್ ಸೇರಿ')
    );
    if (joinPoolBtn) {
      joinPoolBtn.addEventListener('click', async () => {
        try {
          const res = await window.karnatakaFetch(`${API_BASE}/rides/2/book`, {
            method: 'POST',
            body: JSON.stringify({ seats_requested: 1, pickup_stop: 'ಗ್ರಾಮ ಪಂಚಾಯತಿ ಕ್ರಾಸ್' })
          });
          showToast(`🎉 ${res.message} (Flat Fare ₹15)`);
          joinPoolBtn.disabled = true;
          joinPoolBtn.innerHTML = `<span class="material-symbols-outlined text-[18px]">check_circle</span> ಬುಕ್ ಆಗಿದೆ (Joined)`;
        } catch (e) {
          showToast(`Error: ${e.message}`);
        }
      });
    }

    // Reserve Backup Minibus
    const reserveBtn = Array.from(document.querySelectorAll('button')).find(b =>
      b.textContent.includes('Reserve') || b.textContent.includes('ಕಾಯ್ದಿರಿಸಿ')
    );
    if (reserveBtn && !reserveBtn.closest('header')) {
      reserveBtn.addEventListener('click', async () => {
        try {
          const res = await window.karnatakaFetch(`${API_BASE}/rides/3/book`, {
            method: 'POST',
            body: JSON.stringify({ seats_requested: 1, pickup_stop: 'ಬ್ಯಾಡಗಿ ತಾಲೂಕು ಆಫೀಸ್' })
          });
          showToast(`🚌 ${res.message} (Subsidized ₹10)`);
          reserveBtn.disabled = true;
          reserveBtn.innerHTML = `<span class="material-symbols-outlined text-[18px]">done_all</span> ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ`;
        } catch (e) {
          showToast(`Error: ${e.message}`);
        }
      });
    }

    // Cancel Booking hook on My Bookings page
    document.querySelectorAll('button').forEach(btn => {
      const text = btn.textContent.toLowerCase();
      if (text.includes('cancel') || text.includes('ರದ್ದು')) {
        btn.addEventListener('click', async () => {
          if (confirm('Cancel this booking and release seat? / ಈ ಬುಕಿಂಗ್ ರದ್ದು ಮಾಡಲು ಖಚಿತಪಡಿಸಿ?')) {
            try {
              const res = await window.karnatakaFetch(`${API_BASE}/rides/bookings/1/cancel`, { method: 'POST' });
              showToast(`✅ ${res.message}`);
              btn.closest('.rounded-2xl')?.classList.add('opacity-40');
              btn.disabled = true;
              btn.textContent = 'Cancelled / ರದ್ದುಗೊಂಡಿದೆ';
            } catch (err) {
              showToast(err.message);
            }
          }
        });
      }
    });
  }

  // 7. Bus Stop on Demand Petition Modal
  function openStopOnDemandModal() {
    const modalId = 'routeless-pickup-modal';
    const old = document.getElementById(modalId);
    if (old) old.remove();

    const isKn = window.KarnatakaState.language === 'kn';

    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm';
    modal.innerHTML = `
      <div class="relative w-full max-w-sm rounded-2xl bg-surface-container-lowest border border-outline-variant p-6 shadow-2xl space-y-3">
        <div class="flex items-center justify-between border-b border-outline-variant pb-2">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-[22px]">add_location_alt</span>
            <h3 class="font-bold text-sm text-primary">${isKn ? 'ಸ್ಟಾಪ್ ವಿನಂತಿ / Bus Stop on Demand' : 'Bus Stop on Demand Petition'}</h3>
          </div>
          <button id="close-pickup-modal" class="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center">
            <span class="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        <p class="text-xs text-on-surface-variant">${isKn ? 'ನಿಮ್ಮ ಹಳ್ಳಿಗೆ ಹೊಸ ನಿಲುಗಡೆಗಾಗಿ ಸಾರಿಗೆ ನಿಯಂತ್ರಣ ಕೊಠಡಿಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ:' : 'Petition a new rural student pickup stop for the Transit Coordination Board:'}</p>

        <form id="pickup-form" class="space-y-2 text-xs">
          <div>
            <label class="font-semibold block mb-0.5 text-on-surface">${isKn ? 'ಹಳ್ಳಿ / Village' : 'Village'}</label>
            <input id="pickup-village" class="w-full p-2 rounded-xl bg-surface-container border border-outline-variant/60 text-on-surface outline-none" value="Motebennur" required />
          </div>
          <div>
            <label class="font-semibold block mb-0.5 text-on-surface">${isKn ? 'ಲ್ಯಾಂಡ್‌ಮಾರ್ಕ್ / Pickup Landmark' : 'Pickup Landmark'}</label>
            <input id="pickup-landmark" class="w-full p-2 rounded-xl bg-surface-container border border-outline-variant/60 text-on-surface outline-none" value="Motebennur Lake Cross Road Junction" required />
          </div>
          <div>
            <label class="font-semibold block mb-0.5 text-on-surface">${isKn ? 'ಕಾಲೇಜು / Destination Campus' : 'Destination Campus'}</label>
            <input id="pickup-dest" class="w-full p-2 rounded-xl bg-surface-container border border-outline-variant/60 text-on-surface outline-none" value="Govt First Grade College, Haveri" required />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="font-semibold block mb-0.5 text-on-surface">${isKn ? 'ಸಮಯ / Preferred Time' : 'Time'}</label>
              <input id="pickup-time" class="w-full p-2 rounded-xl bg-surface-container border border-outline-variant/60 text-on-surface outline-none" value="07:30 AM" />
            </div>
            <div>
              <label class="font-semibold block mb-0.5 text-on-surface">${isKn ? 'ವಿದ್ಯಾರ್ಥಿಗಳು / Students' : 'Students'}</label>
              <input id="pickup-count" type="number" class="w-full p-2 rounded-xl bg-surface-container border border-outline-variant/60 text-on-surface outline-none" value="6" />
            </div>
          </div>
          <button type="submit" class="w-full mt-2 py-2.5 rounded-xl bg-primary text-on-primary font-bold shadow-md hover:opacity-95 transition-opacity">
            ${isKn ? 'ವಿನಂತಿ ಸಲ್ಲಿಸಿ / Submit Petition' : 'Submit Demand Petition'}
          </button>
        </form>
      </div>
    `;

    document.body.appendChild(modal);
    document.getElementById('close-pickup-modal').onclick = () => modal.remove();

    document.getElementById('pickup-form').onsubmit = async (e) => {
      e.preventDefault();
      try {
        const payload = {
          village: document.getElementById('pickup-village').value,
          landmark: document.getElementById('pickup-landmark').value,
          destination: document.getElementById('pickup-dest').value,
          preferred_time: document.getElementById('pickup-time').value,
          passenger_count: Number(document.getElementById('pickup-count').value) || 1
        };
        const res = await window.karnatakaFetch(`${API_BASE}/pickups/request`, {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        modal.remove();
        showToast(`🎉 ${res.message}`);
      } catch (err) {
        alert(err.message);
      }
    };
  }

  // 8. 31 Karnataka Districts Picker Modal
  async function openDistrictModal() {
    const modalId = 'routeless-district-modal';
    const old = document.getElementById(modalId);
    if (old) old.remove();

    let districts = [];
    try {
      const res = await window.karnatakaFetch(`${API_BASE}/locations/districts`);
      districts = res.districts || [];
    } catch (e) {
      districts = [{ name: 'Haveri', kannada_name: 'ಹಾವೇರಿ' }, { name: 'Dharwad', kannada_name: 'ಧಾರವಾಡ' }, { name: 'Belagavi', kannada_name: 'ಬೆಳಗಾವಿ' }];
    }

    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm';
    modal.innerHTML = `
      <div class="relative w-full max-w-md max-h-[85vh] rounded-2xl bg-surface-container-lowest border border-outline-variant p-6 shadow-2xl flex flex-col">
        <div class="flex items-center justify-between border-b border-outline-variant pb-3 mb-3">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-[24px]">map</span>
            <div>
              <h3 class="font-bold text-sm text-primary">ಕರ್ನಾಟಕದ 31 ಜಿಲ್ಲೆಗಳು</h3>
              <p class="text-xs text-on-surface-variant">Select District (Active: ${window.KarnatakaState.district})</p>
            </div>
          </div>
          <button id="close-dist-modal" class="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center">
            <span class="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
        <div class="overflow-y-auto flex-1 grid grid-cols-2 gap-2 pr-1">
          ${districts.map(d => `
            <button class="district-opt-btn p-2 rounded-xl text-left border ${d.name === window.KarnatakaState.district ? 'border-primary bg-primary-container/10 text-primary font-bold' : 'border-outline-variant/50 hover:bg-surface-container-low text-on-surface text-xs'} transition-all" data-name="${d.name}">
              <div class="font-semibold text-xs">${d.name}</div>
              <div class="text-[11px] text-on-surface-variant">${d.kannada_name}</div>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    document.getElementById('close-dist-modal').onclick = () => modal.remove();

    modal.querySelectorAll('.district-opt-btn').forEach(b => {
      b.onclick = () => {
        const chosen = b.getAttribute('data-name');
        window.KarnatakaState.district = chosen;
        localStorage.setItem('routeless_district', chosen);
        modal.remove();
        showToast(`Corridor: ${chosen}`);
        setTimeout(() => window.location.reload(), 300);
      };
    });
  }

  // 9. Multilingual Voice Assistant Modal
  function openVoiceAssistantModal() {
    const modalId = 'routeless-voice-modal';
    const old = document.getElementById(modalId);
    if (old) old.remove();

    const isKn = window.KarnatakaState.language === 'kn';

    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md';
    modal.innerHTML = `
      <div class="relative w-full max-w-sm rounded-3xl bg-surface-container-lowest border border-outline-variant p-6 shadow-2xl flex flex-col items-center text-center space-y-4">
        <button id="close-voice-modal" class="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container flex items-center justify-center">
          <span class="material-symbols-outlined text-sm">close</span>
        </button>

        <div class="flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container/15 text-primary text-xs font-bold">
          <span class="w-2 h-2 rounded-full bg-secondary-fixed-dim animate-pulse"></span>
          <span>${isKn ? 'ರೂಟ್‌ಲೆಸ್ AI ವಾಯ್ಸ್ ಸಹಾಯಕ' : 'Routeless Voice Assistant'}</span>
        </div>

        <h3 class="font-bold text-base text-primary">${isKn ? 'ನಿಮ್ಮ ಮಾತನ್ನು ಆಲಿಸಲಾಗುತ್ತಿದೆ...' : 'Listening to your voice...'}</h3>

        <div class="relative flex items-center justify-center my-3">
          <button id="modal-mic-btn" class="relative z-10 w-16 h-16 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg active:scale-90 transition-transform">
            <span class="material-symbols-outlined text-[32px]">mic</span>
          </button>
        </div>

        <p id="voice-transcript" class="text-xs text-on-surface-variant italic px-2">
          ${isKn ? '"ಕಾಲೇಜಿಗೆ ಬಸ್ ಇದೆಯಾ?" ಅಥವಾ "ಕ್ರೂಸರ್ ಬುಕ್ ಮಾಡಿ"' : '"Find bus to Haveri college" or "Book shared cruiser"'}
        </p>

        <div id="voice-response-card" class="hidden w-full p-3 rounded-2xl bg-surface-container text-xs text-left border border-outline-variant/50 text-on-surface space-y-2">
          <p id="voice-response-text" class="font-medium text-xs leading-relaxed"></p>
        </div>

        <div class="flex gap-2 w-full pt-1">
          <button id="voice-text-fallback" class="flex-1 py-2 rounded-xl bg-surface-container text-on-surface text-xs font-semibold hover:bg-surface-container-high transition-colors">
            ${isKn ? 'ಪಠ್ಯ ಮೋಡ್ / Type' : 'Type Message'}
          </button>
          <button id="voice-close-done" class="flex-1 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:opacity-95 transition-opacity">
            ${isKn ? 'ಮುಕ್ತಾಯ / Done' : 'Done'}
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    document.getElementById('close-voice-modal').onclick = () => modal.remove();
    document.getElementById('voice-close-done').onclick = () => modal.remove();

    const micBtn = document.getElementById('modal-mic-btn');
    const transcriptEl = document.getElementById('voice-transcript');
    const respCard = document.getElementById('voice-response-card');
    const respText = document.getElementById('voice-response-text');

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = window.KarnatakaState.language === 'kn' ? 'kn-IN' : 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        micBtn.classList.add('ring-4', 'ring-secondary-fixed');
        transcriptEl.textContent = isKn ? 'ಧ್ವನಿ ಸ್ವೀಕರಿಸಲಾಗುತ್ತಿದೆ...' : 'Recording speech...';
      };

      recognition.onend = () => micBtn.classList.remove('ring-4', 'ring-secondary-fixed');

      recognition.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        transcriptEl.textContent = `"${transcript}"`;
        await executeVoiceQuery(transcript, respCard, respText);
      };

      micBtn.onclick = () => {
        try { recognition.start(); } catch (err) { /* start error */ }
      };
    } else {
      micBtn.onclick = () => {
        const input = prompt(isKn ? 'ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಟೈಪ್ ಮಾಡಿ:' : 'Enter transit query:');
        if (input) {
          transcriptEl.textContent = `"${input}"`;
          executeVoiceQuery(input, respCard, respText);
        }
      };
    }

    document.getElementById('voice-text-fallback').onclick = () => {
      const input = prompt(isKn ? 'ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಟೈಪ್ ಮಾಡಿ:' : 'Enter transit query:');
      if (input) {
        transcriptEl.textContent = `"${input}"`;
        executeVoiceQuery(input, respCard, respText);
      }
    };
  }

  async function executeVoiceQuery(queryText, respCard, respText) {
    try {
      const res = await window.karnatakaFetch(`${API_BASE}/assistant/message`, {
        method: 'POST',
        body: JSON.stringify({
          text: queryText,
          language: window.KarnatakaState.language
        })
      });

      if (res.success) {
        respCard.classList.remove('hidden');
        respText.textContent = res.response_text;

        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(res.response_text);
          utterance.lang = window.KarnatakaState.language === 'kn' ? 'kn-IN' : 'en-IN';
          window.speechSynthesis.speak(utterance);
        }
      }
    } catch (e) {
      respCard.classList.remove('hidden');
      respText.textContent = `Error: ${e.message}`;
    }
  }

  function showToast(msg) {
    const old = document.querySelector('.routeless-toast');
    if (old) old.remove();

    const toast = document.createElement('div');
    toast.className = 'routeless-toast fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-primary text-on-primary text-xs font-semibold shadow-2xl';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  }

  // ---- Language First-Time Selection Screen ----
  function showLanguageSelectionScreen() {
    const existing = document.getElementById('routeless-lang-select-screen');
    if (existing) return;

    const overlay = document.createElement('div');
    overlay.id = 'routeless-lang-select-screen';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:var(--color-surface,#faf8ff);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:1.5rem;font-family:Inter,sans-serif;';
    overlay.innerHTML = `
      <div style="text-align:center;margin-bottom:1.5rem;">
        <div style="display:inline-flex;align-items:center;gap:0.5rem;background:var(--color-surface-container-low,#f2f3ff);padding:0.5rem 1rem;border-radius:999px;margin-bottom:1rem;">
          <span class="material-symbols-outlined" style="color:var(--color-primary,#00236f)">directions_bus</span>
          <span style="font-weight:700;color:var(--color-primary,#00236f)">ROUTELESS</span>
        </div>
        <h1 style="font-size:1.3rem;font-weight:700;color:var(--color-on-surface,#131b2e);margin:0 0 0.5rem;">Choose Your Language</h1>
        <p style="font-size:0.85rem;color:var(--color-on-surface-variant,#444651);">ನಿಮ್ಮ ಭಾಷೆ ಆಯ್ಕೆ ಮಾಡಿ • अपनी भाषा चुनें</p>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;width:100%;max-width:360px;">
        ${[
          { code:'kn', name:'ಕನ್ನಡ', sub:'Kannada', flag:'🇮🇳' },
          { code:'en', name:'English', sub:'English', flag:'🌐' },
          { code:'hi', name:'हिन्दी', sub:'Hindi', flag:'🇮🇳' },
          { code:'te', name:'తెలుగు', sub:'Telugu', flag:'🇮🇳' },
          { code:'ta', name:'தமிழ்', sub:'Tamil', flag:'🇮🇳' },
          { code:'ml', name:'മലയാളം', sub:'Malayalam', flag:'🇮🇳' }
        ].map(l => `
          <button data-lang-code="${l.code}"
            style="padding:1rem;border-radius:1rem;border:2px solid var(--color-outline-variant,#c5c5d3);background:var(--color-surface-container-lowest,#fff);cursor:pointer;text-align:center;transition:all 0.15s;">
            <div style="font-size:1.5rem;margin-bottom:0.3rem;">${l.flag}</div>
            <div style="font-weight:700;font-size:1rem;color:var(--color-on-surface,#131b2e);">${l.name}</div>
            <div style="font-size:0.7rem;color:var(--color-on-surface-variant,#444651);">${l.sub}</div>
          </button>
        `).join('')}
      </div>
      <p style="font-size:0.72rem;color:var(--color-on-surface-variant,#444651);margin-top:1rem;text-align:center;">You can change this anytime in Settings.</p>
    `;

    document.body.appendChild(overlay);

    overlay.querySelectorAll('[data-lang-code]').forEach(btn => {
      btn.addEventListener('mouseover', () => { btn.style.borderColor = 'var(--color-primary,#00236f)'; btn.style.background = 'var(--color-surface-container-low,#f2f3ff)'; });
      btn.addEventListener('mouseout', () => { btn.style.borderColor = 'var(--color-outline-variant,#c5c5d3)'; btn.style.background = 'var(--color-surface-container-lowest,#fff)'; });
      btn.addEventListener('click', () => {
        const code = btn.getAttribute('data-lang-code');
        localStorage.setItem('routeless_lang_chosen', '1');
        window.setLanguage(code);
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.3s';
        setTimeout(() => overlay.remove(), 300);
      });
    });
  }

  // ---- Proper Logout ----
  window.routelessLogout = async function() {
    const token = localStorage.getItem('routeless_token');
    try {
      if (token) {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' }
        });
      }
    } catch (e) { /* ignore network errors on logout */ }

    // Clear all auth state
    localStorage.removeItem('routeless_token');
    localStorage.removeItem('routeless_user');
    // Keep language and theme preferences
    sessionStorage.clear();

    // Redirect to login
    window.location.replace('/login');
  };

  // Wire logout buttons on any page
  function initLogout() {
    document.querySelectorAll('[data-action="logout"], #logout-btn, .logout-btn').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (confirm('Sign out of Routeless?\n\nYour language and theme preferences will be saved.')) {
          window.routelessLogout();
        }
      });
    });

    // Also handle text-based logout buttons
    document.querySelectorAll('button').forEach(btn => {
      const icon = btn.querySelector('.material-symbols-outlined');
      if (icon && icon.textContent.trim() === 'logout') {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (confirm('Sign out of Routeless?')) window.routelessLogout();
        });
      }
    });
  }

  // Startup Orchestrator
  document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initBookingOperations();
    syncPreferencesOnStartup();
    initLogout();

    // First-time language selection
    const hasChosen = localStorage.getItem('routeless_lang_chosen');
    const hasToken = localStorage.getItem('routeless_token');
    const isAuthPage = ['/login', '/register'].includes(window.location.pathname);

    if (!hasChosen && !isAuthPage) {
      showLanguageSelectionScreen();
    }

    // Apply IST time to any element with data-timestamp attribute
    document.querySelectorAll('[data-timestamp]').forEach(el => {
      const ts = el.getAttribute('data-timestamp');
      el.textContent = window.RoutelessTime.toIST(ts);
    });
  });
})();
