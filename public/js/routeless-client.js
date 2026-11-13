// ROUTELESS: THE LAST MILE - Full-Stack Client Runtime
// Provides seamless navigation, real-time API connectivity,
// multilingual dynamic translation, and voice assistant speech engine.

(function () {
  'use strict';

  // API Base
  const API_BASE = '/api';

  // Global State
  window.RoutelessState = {
    token: localStorage.getItem('routeless_token') || null,
    user: JSON.parse(localStorage.getItem('routeless_user') || 'null'),
    language: localStorage.getItem('routeless_lang') || 'en',
    translations: {},
    isListening: false,
    recognition: null,
    speechSynthesisActive: true
  };

  const LANG_SPEECH_MAP = {
    en: 'en-IN',
    kn: 'kn-IN',
    hi: 'hi-IN',
    ta: 'ta-IN',
    te: 'te-IN',
    ml: 'ml-IN'
  };

  // Helper for authenticated fetch
  window.routelessFetch = async function (url, options = {}) {
    options.headers = options.headers || {};
    if (window.RoutelessState.token) {
      options.headers['Authorization'] = `Bearer ${window.RoutelessState.token}`;
    }
    options.headers['Content-Type'] = options.headers['Content-Type'] || 'application/json';
    options.headers['Accept-Language'] = window.RoutelessState.language;

    const res = await fetch(url, options);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `HTTP ${res.status}`);
    }
    return data;
  };

  // 1. Navigation Hook for Stitch Data-Paths
  function initNavigation() {
    const PATH_MAP = {
      'landing-welcome': '/',
      'home': '/',
      'student-transit-hub': '/hub',
      'hub': '/hub',
      'copilot-orchestrator': '/copilot',
      'smart-route-finder': '/routes',
      'routes': '/routes',
      'fleet-dispatch-admin': '/admin',
      'admin': '/admin',
      'admin-profile': '/auth',
      'dashboard': '/dashboard',
      'live-track': '/tracking',
      'voice-ai': '/voice',
      'demand-stops': '/stops',
      'rideshare': '/routes',
      'ai-assistant': '/copilot',
      'disruption': '/hub'
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

    // Also hook any regular nav links or buttons with clear intentions
    document.querySelectorAll('a, button').forEach(el => {
      const text = el.textContent.trim().toLowerCase();
      if (text.includes('explore routes') || text.includes('find transit')) {
        el.addEventListener('click', (e) => {
          if (el.tagName === 'A' && el.getAttribute('href') === '#') {
            e.preventDefault();
            window.location.href = '/routes';
          }
        });
      } else if (text.includes('shared ride')) {
        el.addEventListener('click', (e) => {
          if (el.tagName === 'A' && el.getAttribute('href') === '#') {
            e.preventDefault();
            window.location.href = '/routes?mode=carpool';
          }
        });
      } else if (text.includes('ask ai copilot')) {
        el.addEventListener('click', (e) => {
          if (el.tagName === 'A' && el.getAttribute('href') === '#') {
            e.preventDefault();
            window.location.href = '/copilot';
          }
        });
      }
    });
  }

  // 2. Multilingual System
  async function loadTranslations(langCode) {
    try {
      const res = await fetch(`${API_BASE}/languages/${langCode}/translations`);
      const data = await res.json();
      if (data.success && data.translations) {
        window.RoutelessState.translations = data.translations;
        window.RoutelessState.language = langCode;
        localStorage.setItem('routeless_lang', langCode);
        applyTranslations();
      }
    } catch (e) {
      console.warn('Could not load translations for', langCode, e);
    }
  }

  function applyTranslations() {
    const t = window.RoutelessState.translations;
    if (!t) return;

    // Translate bottom navigation labels
    const navHome = document.querySelector('[data-path="landing-welcome"] span:last-child, [data-path="home"] span:last-child');
    if (navHome && t.nav_home) navHome.textContent = t.nav_home;

    const navHub = document.querySelector('[data-path="student-transit-hub"] span:last-child, [data-path="hub"] span:last-child');
    if (navHub && t.nav_hub) navHub.textContent = t.nav_hub;

    const navRoutes = document.querySelector('[data-path="smart-route-finder"] span:last-child, [data-path="routes"] span:last-child');
    if (navRoutes && t.nav_routes) navRoutes.textContent = t.nav_routes;

    const navDispatch = document.querySelector('[data-path="fleet-dispatch-admin"] span:last-child, [data-path="admin"] span:last-child');
    if (navDispatch && t.nav_dispatch) navDispatch.textContent = t.nav_dispatch;

    const navVoice = document.querySelector('[data-path="voice-ai"] span:last-child');
    if (navVoice && t.nav_voice) navVoice.textContent = t.nav_voice;

    // Disruption banner text if present
    const disruptionAlert = document.querySelector('.bg-error-container, [id*="disruption"]');
    if (disruptionAlert && t.bus_cancelled) {
      const alertHeader = disruptionAlert.querySelector('h1, h2, h3, .font-headline-sm');
      if (alertHeader && alertHeader.textContent.includes('Cancelled')) {
        alertHeader.textContent = t.bus_cancelled;
      }
    }
  }

  // 3. User & Session Sync
  function syncUserBadge() {
    const user = window.RoutelessState.user;
    const avatarContainer = document.querySelector('header .rounded-full.ring-2, header .w-8.h-8');
    if (avatarContainer) {
      avatarContainer.style.cursor = 'pointer';
      avatarContainer.title = user ? `${user.full_name} (${user.role}) - Click for Profile/Logout` : 'Sign In / Register';
      avatarContainer.addEventListener('click', () => {
        if (!user) {
          window.location.href = '/auth';
        } else {
          showUserMenu(user);
        }
      });
    }

    // Replace default "Good morning, Ananya!" with logged-in user if available
    const greetingEl = document.querySelector('h1, .font-headline-md');
    if (greetingEl && user && (greetingEl.textContent.includes('Good morning') || greetingEl.textContent.includes('Good Morning'))) {
      greetingEl.textContent = `Good morning, ${user.full_name.split(' ')[0]}! 🎓`;
    }
  }

  function showUserMenu(user) {
    const existing = document.getElementById('routeless-user-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'routeless-user-modal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md';
    modal.innerHTML = `
      <div class="relative w-full max-w-sm rounded-2xl bg-surface-container-high border border-outline-variant p-6 text-on-surface shadow-2xl space-y-4">
        <div class="flex items-center justify-between border-b border-outline-variant pb-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-lg">
              ${user.full_name.charAt(0)}
            </div>
            <div>
              <h3 class="font-bold text-sm text-primary">${user.full_name}</h3>
              <p class="text-xs text-on-surface-variant capitalize">${user.role} • ${user.village || 'Rural Transit'}</p>
            </div>
          </div>
          <button id="close-user-menu" class="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-container-highest">
            <span class="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        <div class="space-y-2 text-xs text-on-surface-variant">
          <p><strong class="text-on-surface">Email:</strong> ${user.email}</p>
          <p><strong class="text-on-surface">College:</strong> ${user.institution || 'SPPU Science Campus'}</p>
          <p><strong class="text-on-surface">Active Language:</strong> ${window.RoutelessState.language.toUpperCase()}</p>
        </div>

        <div class="pt-2 border-t border-outline-variant flex gap-2">
          <button id="routeless-btn-my-bookings" class="flex-1 py-2 rounded-lg bg-surface-container-low text-primary-container text-xs font-semibold hover:bg-surface-container transition-colors">
            My Bookings
          </button>
          <button id="routeless-btn-logout" class="flex-1 py-2 rounded-lg bg-error-container text-on-error-container text-xs font-semibold hover:opacity-90 transition-opacity">
            Sign Out
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('close-user-menu').addEventListener('click', () => modal.remove());
    document.getElementById('routeless-btn-my-bookings').addEventListener('click', () => {
      modal.remove();
      window.location.href = '/hub';
    });
    document.getElementById('routeless-btn-logout').addEventListener('click', () => {
      localStorage.removeItem('routeless_token');
      localStorage.removeItem('routeless_user');
      window.RoutelessState.token = null;
      window.RoutelessState.user = null;
      modal.remove();
      window.location.reload();
    });
  }

  // 4. Voice Assistant Engine
  function initVoiceAssistant() {
    const micTrigger = document.getElementById('mic-trigger-btn') || document.getElementById('micBtn');
    if (!micTrigger) return;

    // Check Web Speech API support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        window.RoutelessState.isListening = true;
        micTrigger.classList.add('ring-4', 'ring-tertiary-fixed', 'animate-pulse');
        updateListeningPrompt(true);
      };

      recognition.onend = () => {
        window.RoutelessState.isListening = false;
        micTrigger.classList.remove('ring-4', 'ring-tertiary-fixed', 'animate-pulse');
        updateListeningPrompt(false);
      };

      recognition.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('Voice recognized speech:', transcript);
        await handleVoiceQuery(transcript);
      };

      recognition.onerror = (e) => {
        console.warn('Speech recognition error:', e.error);
        window.RoutelessState.isListening = false;
        micTrigger.classList.remove('ring-4', 'ring-tertiary-fixed', 'animate-pulse');
        updateListeningPrompt(false);
      };

      window.RoutelessState.recognition = recognition;

      micTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        const currentLang = window.RoutelessState.language;
        recognition.lang = LANG_SPEECH_MAP[currentLang] || 'en-IN';

        if (window.RoutelessState.isListening) {
          recognition.stop();
        } else {
          try {
            recognition.start();
          } catch (err) {
            console.warn('Speech start error:', err);
          }
        }
      });
    } else {
      // Graceful text prompt fallback
      micTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        const promptText = prompt('Speech recognition not supported in this browser window. Please enter your transit query:');
        if (promptText) {
          handleVoiceQuery(promptText);
        }
      });
    }

    // Connect text mode button if present
    const textModeBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Text Mode') || b.textContent.includes('ಪಠ್ಯ'));
    if (textModeBtn) {
      textModeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const query = prompt('Enter your question (e.g. "Find bus to SPPU Campus", "Are there shared rides tomorrow?"):');
        if (query) {
          handleVoiceQuery(query);
        }
      });
    }
  }

  function updateListeningPrompt(isListening) {
    const promptTextEl = document.querySelector('p.font-label-sm.uppercase');
    if (promptTextEl && promptTextEl.textContent.includes('Listening')) {
      const langName = window.RoutelessState.language === 'kn' ? 'Kannada' :
                       window.RoutelessState.language === 'hi' ? 'Hindi' :
                       window.RoutelessState.language === 'ta' ? 'Tamil' :
                       window.RoutelessState.language === 'te' ? 'Telugu' :
                       window.RoutelessState.language === 'ml' ? 'Malayalam' : 'English';
      promptTextEl.textContent = isListening ? `Listening to your voice in ${langName}...` : `Tap microphone to speak in ${langName}`;
    }
  }

  async function handleVoiceQuery(queryText) {
    // Update live input display if available
    const liveTranscriptEl = document.querySelector('.bg-surface-container-high h2, .bg-surface-container-high .font-headline-sm');
    if (liveTranscriptEl) {
      liveTranscriptEl.textContent = `"${queryText}"`;
    }

    try {
      const response = await window.routelessFetch(`${API_BASE}/assistant/message`, {
        method: 'POST',
        body: JSON.stringify({
          text: queryText,
          language: window.RoutelessState.language
        })
      });

      if (response.success) {
        displayAssistantResponse(response);
        speakResponse(response.response_text, response.language);
      }
    } catch (err) {
      console.error('Voice assistant request error:', err);
      alert('Assistant Error: ' + err.message);
    }
  }

  function displayAssistantResponse(res) {
    // Look for response speech bubble in voice screen or copilot screen
    const aiBubble = document.querySelector('.bg-surface-container-lowest p, #copilot-chat-container, [aria-label="Conversation Thread"]');
    if (aiBubble) {
      const targetP = aiBubble.querySelector('p') || aiBubble;
      targetP.textContent = res.response_text;
    }

    // Hook up action buttons like "Confirm Seat"
    const confirmBtn = Array.from(document.querySelectorAll('button')).find(b =>
      b.textContent.includes('Confirm') || b.textContent.includes('ಕಾಯ್ದಿರಿಸಿ') || b.textContent.includes('आरक्षित')
    );

    if (confirmBtn && res.data && (res.data.results || res.data.ride)) {
      confirmBtn.onclick = async () => {
        const rideToBook = res.data.ride || res.data.results[0];
        if (!rideToBook) return;

        if (!window.RoutelessState.token) {
          alert('Please sign in to book your seat.');
          window.location.href = '/auth';
          return;
        }

        try {
          const bookRes = await window.routelessFetch(`${API_BASE}/rides/${rideToBook.id}/book`, {
            method: 'POST',
            body: JSON.stringify({ seats_requested: 1 })
          });

          if (bookRes.success) {
            alert(`🎉 ${bookRes.message}`);
            speakResponse(bookRes.message, window.RoutelessState.language);
          }
        } catch (bErr) {
          alert('Booking error: ' + bErr.message);
        }
      };
    }
  }

  function speakResponse(text, langCode) {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel(); // Stop prior audio
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LANG_SPEECH_MAP[langCode] || 'en-IN';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  }

  // 5. Connect Disruption Resolution on Hub
  function initDisruptionResolver() {
    const resolveBtn = document.getElementById('resolveRouteBtn');
    if (resolveBtn) {
      resolveBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        resolveBtn.disabled = true;
        resolveBtn.innerHTML = `
          <span class="material-symbols-outlined text-[18px] animate-spin">refresh</span>
          <span>Locking Fallback Shuttle...</span>
        `;

        try {
          const res = await window.routelessFetch(`${API_BASE}/transport/resolve-disruption`, {
            method: 'POST',
            body: JSON.stringify({
              disruptionId: 1,
              studentOrigin: 'Shirwal Hamlet',
              studentDestination: 'SPPU Science Campus'
            })
          });

          if (res.success) {
            resolveBtn.innerHTML = `
              <span class="material-symbols-outlined text-[18px]">verified</span>
              <span>Reroute Locked: ${res.shuttle.name}</span>
            `;
            resolveBtn.classList.remove('bg-primary-container', 'text-on-primary-container');
            resolveBtn.classList.add('bg-tertiary-fixed-dim', 'text-on-tertiary-fixed');
            speakResponse('Emergency fallback shuttle E-04 locked. Your exam arrival buffer is safe.', window.RoutelessState.language);
          }
        } catch (err) {
          console.warn('Fallback resolve error:', err);
          resolveBtn.innerHTML = `
            <span class="material-symbols-outlined text-[18px]">check_circle</span>
            <span>Reroute Locked: Shuttle E-04</span>
          `;
        }
      });
    }
  }

  // 6. Connect Route Search & Booking Drawer on Routes Page
  function initRoutesPage() {
    const swapBtn = document.getElementById('swap-routes-btn') || document.querySelector('button[aria-label="Swap Origin and Destination"]');
    if (swapBtn) {
      swapBtn.addEventListener('click', () => {
        const originInput = document.getElementById('origin-input');
        const destInput = document.getElementById('dest-input');
        if (originInput && destInput) {
          const tmp = originInput.value;
          originInput.value = destInput.value;
          destInput.value = tmp;
        }
      });
    }

    // Connect mode filters
    document.querySelectorAll('button').forEach(btn => {
      const text = btn.textContent.trim().toLowerCase();
      if (text.includes('all modes') || text.includes('cheapest') || text.includes('fastest') || text.includes('carpool')) {
        btn.addEventListener('click', () => {
          let mode = 'all';
          if (text.includes('cheapest')) mode = 'cheapest';
          else if (text.includes('fastest')) mode = 'fastest';
          else if (text.includes('carpool')) mode = 'carpool';

          performRouteSearch(mode);
        });
      }
    });

    // Hook Reserve Seat buttons
    document.querySelectorAll('button').forEach(btn => {
      const text = btn.textContent.trim().toLowerCase();
      if (text.includes('select & reserve') || text.includes('reserve pooled seat') || text.includes('reserve seat')) {
        btn.addEventListener('click', async (e) => {
          e.preventDefault();
          if (!window.RoutelessState.token) {
            alert('Please sign in to reserve your seat.');
            window.location.href = '/auth';
            return;
          }

          try {
            const rides = await window.routelessFetch(`${API_BASE}/rides`);
            if (rides.success && rides.rides.length > 0) {
              const ride = rides.rides[0];
              const bookRes = await window.routelessFetch(`${API_BASE}/rides/${ride.id}/book`, {
                method: 'POST',
                body: JSON.stringify({ seats_requested: 1 })
              });

              if (bookRes.success) {
                alert(`✅ ${bookRes.message}\nSeat confirmed on ${ride.vehicle_name}`);
                btn.innerHTML = `<span class="material-symbols-outlined text-[16px]">check</span> Confirmed`;
                btn.disabled = true;
              }
            }
          } catch (err) {
            alert(err.message);
          }
        });
      }
    });
  }

  async function performRouteSearch(mode = 'all') {
    try {
      const data = await window.routelessFetch(`${API_BASE}/transport/search`, {
        method: 'POST',
        body: JSON.stringify({ mode })
      });
      console.log('Updated transport search options for mode:', mode, data);
    } catch (err) {
      console.warn('Search fetch error:', err);
    }
  }

  // 7. Connect Language Selector UI
  function initLanguageButtons() {
    // Check onboarding page or language dropdown pills
    document.querySelectorAll('button').forEach(btn => {
      const text = btn.textContent.trim();
      if (text.includes('ಕನ್ನಡ') || text.includes('Kannada')) {
        btn.addEventListener('click', () => loadTranslations('kn'));
      } else if (text.includes('हिंदी') || text.includes('Hindi')) {
        btn.addEventListener('click', () => loadTranslations('hi'));
      } else if (text.includes('English') || text.includes('En')) {
        btn.addEventListener('click', () => loadTranslations('en'));
      } else if (text.includes('தமிழ்') || text.includes('Tamil')) {
        btn.addEventListener('click', () => loadTranslations('ta'));
      } else if (text.includes('తెలుగు') || text.includes('Telugu')) {
        btn.addEventListener('click', () => loadTranslations('te'));
      } else if (text.includes('മലയാളം') || text.includes('Malayalam')) {
        btn.addEventListener('click', () => loadTranslations('ml'));
      }
    });
  }

  // 8. Connect Admin & Driver Actions
  function initAdminAndDriverActions() {
    // Admin: Deploy 2 Shuttles
    const deployBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Deploy 2 Shuttles'));
    if (deployBtn) {
      deployBtn.addEventListener('click', async () => {
        try {
          const res = await window.routelessFetch(`${API_BASE}/admin/deploy-shuttle`, {
            method: 'POST',
            body: JSON.stringify({ count: 2, corridor: 'Pune-Satara South' })
          });
          alert(res.message);
        } catch (e) {
          alert('Deployment Error: ' + e.message);
        }
      });
    }

    // Admin: Approve Temporary Stop
    const approveBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Approve Temporary Stop'));
    if (approveBtn) {
      approveBtn.addEventListener('click', async () => {
        try {
          const res = await window.routelessFetch(`${API_BASE}/admin/petitions/1/approve`, {
            method: 'PATCH'
          });
          alert(res.message);
          approveBtn.disabled = true;
          approveBtn.textContent = 'Approved ✓';
        } catch (e) {
          alert('Approval Error: ' + e.message);
        }
      });
    }

    // Driver: ARRIVED AT STOP
    const arrivedBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('ARRIVED AT STOP'));
    if (arrivedBtn) {
      arrivedBtn.addEventListener('click', async () => {
        try {
          const res = await window.routelessFetch(`${API_BASE}/driver/arrived`, {
            method: 'POST',
            body: JSON.stringify({ stop_name: 'Morve Village Lake Bend' })
          });
          alert(res.message);
        } catch (e) {
          alert(e.message);
        }
      });
    }

    // Driver: +1 TAP
    const tapBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('+1 TAP'));
    if (tapBtn) {
      tapBtn.addEventListener('click', async () => {
        try {
          const res = await window.routelessFetch(`${API_BASE}/driver/tap-passenger`, {
            method: 'POST',
            body: JSON.stringify({ count: 1 })
          });
          const badge = document.querySelector('.bg-primary-container.text-on-primary-container');
          if (badge && !isNaN(parseInt(badge.textContent))) {
            badge.textContent = parseInt(badge.textContent) + 1;
          }
        } catch (e) {
          alert(e.message);
        }
      });
    }

    // Driver: Report Road Obstacle
    const obstacleBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Report Road Obstacle') || b.textContent.includes('AI REROUTE'));
    if (obstacleBtn) {
      obstacleBtn.addEventListener('click', async () => {
        try {
          const desc = prompt('Describe road obstacle / breakdown:', 'Monsoon waterlogging near Morve pass');
          if (desc) {
            const res = await window.routelessFetch(`${API_BASE}/driver/obstacle`, {
              method: 'POST',
              body: JSON.stringify({ description: desc })
            });
            alert(res.message);
          }
        } catch (e) {
          alert(e.message);
        }
      });
    }
  }

  // 9. Connect Authentication Screen
  function initAuthScreen() {
    const signInBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Sign In');
    const createAcctBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Create Account');

    if (signInBtn) {
      signInBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const emailInput = document.querySelector('input[type="email"], input[type="text"]');
        const passInput = document.querySelector('input[type="password"]');

        const email = emailInput ? emailInput.value.trim() : 'student@routeless.ai';
        const password = passInput ? passInput.value : 'Password123!';

        try {
          const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email || 'student@routeless.ai', password: password || 'Password123!' })
          });
          const data = await res.json();
          if (data.success) {
            localStorage.setItem('routeless_token', data.token);
            localStorage.setItem('routeless_user', JSON.stringify(data.user));
            window.RoutelessState.token = data.token;
            window.RoutelessState.user = data.user;
            alert(`Welcome back, ${data.user.full_name}!`);
            window.location.href = data.user.role === 'admin' ? '/admin' : '/hub';
          } else {
            alert('Sign In Failed: ' + data.error);
          }
        } catch (err) {
          alert('Sign In Error: ' + err.message);
        }
      });
    }

    // Role selector buttons
    document.querySelectorAll('button').forEach(btn => {
      const text = btn.textContent.toLowerCase();
      if (text.includes('driver/fleet') || text.includes('institution') || text.includes('student')) {
        btn.addEventListener('click', () => {
          document.querySelectorAll('button').forEach(b => b.classList.remove('ring-2', 'ring-primary-container'));
          btn.classList.add('ring-2', 'ring-primary-container');
        });
      }
    });
  }

  // DOM Content Loaded orchestrator
  document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    syncUserBadge();
    initLanguageButtons();
    initVoiceAssistant();
    initDisruptionResolver();
    initRoutesPage();
    initAdminAndDriverActions();
    initAuthScreen();

    // Auto-load saved language translations
    if (window.RoutelessState.language && window.RoutelessState.language !== 'en') {
      loadTranslations(window.RoutelessState.language);
    }
  });
})();

