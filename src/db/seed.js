const db = require('./database');
const bcrypt = require('bcryptjs');

const KARNATAKA_DISTRICTS = [
  { name: 'Bagalkote', kannada_name: 'ಬಾಗಲಕೋಟೆ', code: 'BGK' },
  { name: 'Ballari', kannada_name: 'ಬಳ್ಳಾರಿ', code: 'BLR' },
  { name: 'Belagavi', kannada_name: 'ಬೆಳಗಾವಿ', code: 'BGM' },
  { name: 'Bengaluru Rural', kannada_name: 'ಬೆಂಗಳೂರು ಗ್ರಾಮಾಂತರ', code: 'BLRR' },
  { name: 'Bengaluru Urban', kannada_name: 'ಬೆಂಗಳೂರು ನಗರ', code: 'BLRU' },
  { name: 'Bidar', kannada_name: 'ಬೀದರ್', code: 'BDR' },
  { name: 'Chamarajanagar', kannada_name: 'ಚಾಮರಾಜನಗರ', code: 'CRN' },
  { name: 'Chikkaballapura', kannada_name: 'ಚಿಕ್ಕಬಳ್ಳಾಪುರ', code: 'CBP' },
  { name: 'Chikkamagaluru', kannada_name: 'ಚಿಕ್ಕಮಗಳೂರು', code: 'CKM' },
  { name: 'Chitradurga', kannada_name: 'ಚಿತ್ರದುರ್ಗ', code: 'CTA' },
  { name: 'Dakshina Kannada', kannada_name: 'ದಕ್ಷಿಣ ಕನ್ನಡ', code: 'DKN' },
  { name: 'Davanagere', kannada_name: 'ದಾವಣಗೆರೆ', code: 'DVG' },
  { name: 'Dharwad', kannada_name: 'ಧಾರವಾಡ', code: 'DWD' },
  { name: 'Gadag', kannada_name: 'ಗದಗ', code: 'GDG' },
  { name: 'Hassan', kannada_name: 'ಹಾಸನ', code: 'HSN' },
  { name: 'Haveri', kannada_name: 'ಹಾವೇರಿ', code: 'HVR' },
  { name: 'Kalaburagi', kannada_name: 'ಕಲಬುರಗಿ', code: 'KLB' },
  { name: 'Kodagu', kannada_name: 'ಕೊಡಗು', code: 'KDG' },
  { name: 'Kolar', kannada_name: 'ಕೋಲಾರ', code: 'KLR' },
  { name: 'Koppal', kannada_name: 'ಕೊಪ್ಪಳ', code: 'KPL' },
  { name: 'Mandya', kannada_name: 'ಮಂಡ್ಯ', code: 'MDY' },
  { name: 'Mysuru', kannada_name: 'ಮೈಸೂರು', code: 'MYS' },
  { name: 'Raichur', kannada_name: 'ರಾಯಚೂರು', code: 'RCR' },
  { name: 'Ramanagara', kannada_name: 'ರಾಮನಗರ', code: 'RMG' },
  { name: 'Shivamogga', kannada_name: 'ಶಿವಮೊಗ್ಗ', code: 'SMG' },
  { name: 'Tumakuru', kannada_name: 'ತುಮಕೂರು', code: 'TMK' },
  { name: 'Udupi', kannada_name: 'ಉಡುಪಿ', code: 'UDP' },
  { name: 'Uttara Kannada', kannada_name: 'ಉತ್ತರ ಕನ್ನಡ', code: 'UKN' },
  { name: 'Vijayanagara', kannada_name: 'ವಿಜಯನಗರ', code: 'VJN' },
  { name: 'Vijayapura', kannada_name: 'ವಿಜಯಪುರ', code: 'BJP' },
  { name: 'Yadgir', kannada_name: 'ಯಾದಗಿರಿ', code: 'YDG' }
];

function seedDatabase() {
  // Check if districts are populated
  const districtCount = db.prepare('SELECT COUNT(*) as count FROM districts').get().count;
  if (districtCount === 0) {
    console.log('Seeding 31 Karnataka Districts...');
    const insertDist = db.prepare('INSERT INTO districts (name, kannada_name, code) VALUES (?, ?, ?)');
    KARNATAKA_DISTRICTS.forEach(d => insertDist.run(d.name, d.kannada_name, d.code));
  }

  const haveriDist = db.prepare("SELECT id FROM districts WHERE name = 'Haveri'").get();
  const haveriId = haveriDist ? haveriDist.id : 1;

  // Taluks in Haveri Pilot
  const talukCount = db.prepare('SELECT COUNT(*) as count FROM taluks').get().count;
  if (talukCount === 0) {
    const insertTaluk = db.prepare('INSERT INTO taluks (district_id, name, kannada_name) VALUES (?, ?, ?)');
    const byadgi = insertTaluk.run(haveriId, 'Byadgi', 'ಬ್ಯಾಡಗಿ');
    insertTaluk.run(haveriId, 'Haveri', 'ಹಾವೇರಿ');
    insertTaluk.run(haveriId, 'Ranibennur', 'ರಾಣೆಬೆನ್ನೂರು');
    insertTaluk.run(haveriId, 'Shiggaon', 'ಶಿಗ್ಗಾಂವ್');
    insertTaluk.run(haveriId, 'Hangal', 'ಹಾನಗಲ್');
    insertTaluk.run(haveriId, 'Hirekerur', 'ಹಿರೇಕೆರೂರು');
    insertTaluk.run(haveriId, 'Savanur', 'ಸವಣೂರು');

    // Villages in Byadgi Taluk
    const insertVillage = db.prepare('INSERT INTO villages (taluk_id, name, kannada_name, panchayat) VALUES (?, ?, ?, ?)');
    insertVillage.run(byadgi.lastInsertRowid, 'Motebennur', 'ಮೊಟೆಬೆನ್ನೂರು', 'Motebennur Gram Panchayat');
    insertVillage.run(byadgi.lastInsertRowid, 'Mallur', 'ಮಲ್ಲೂರು', 'Mallur Panchayat');
    insertVillage.run(byadgi.lastInsertRowid, 'Kaginele', 'ಕಾಗಿನೆಲೆ', 'Kaginele Heritage Board');
    insertVillage.run(byadgi.lastInsertRowid, 'Chikkabasur', 'ಚಿಕ್ಕಬಾಸೂರು', 'Chikkabasur GP');

    // Institutions
    const insertInst = db.prepare('INSERT INTO institutions (taluk_id, name, kannada_name, institution_type) VALUES (?, ?, ?, ?)');
    insertInst.run(byadgi.lastInsertRowid, 'Govt First Grade College, Haveri', 'ಸರ್ಕಾರಿ ಪ್ರಥಮ ದರ್ಜೆ ಕಾಲೇಜು, ಹಾವೇರಿ', 'college');
    insertInst.run(byadgi.lastInsertRowid, 'Govt Engineering College, Haveri', 'ಸರ್ಕಾರಿ ಇಂಜಿನಿಯರಿಂಗ್ ಕಾಲೇಜು, ಹಾವೇರಿ', 'engineering');
    insertInst.run(byadgi.lastInsertRowid, 'Byadgi Govt PU College', 'ಬ್ಯಾಡಗಿ ಸರ್ಕಾರಿ ಪದವಿ ಪೂರ್ವ ಕಾಲೇಜು', 'puc');

    // Bus Stops
    const insertStop = db.prepare('INSERT INTO bus_stops (taluk_id, name, kannada_name, latitude, longitude) VALUES (?, ?, ?, ?, ?)');
    insertStop.run(byadgi.lastInsertRowid, 'Byadgi KSRTC Bus Stand', 'ಬ್ಯಾಡಗಿ ಕೆಎಸ್\u200cಆರ್\u200cಟಿಸಿ ಬಸ್ ನಿಲ್ದಾಣ', 14.6811, 75.4859);
    insertStop.run(byadgi.lastInsertRowid, 'Motebennur Gram Panchayat Circle', 'ಮೊಟೆಬೆನ್ನೂರು ಗ್ರಾಮ ಪಂಚಾಯತಿ ಕ್ರಾಸ್', 14.7321, 75.5210);
    insertStop.run(byadgi.lastInsertRowid, 'Haveri College Gate Terminal', 'ಹಾವೇರಿ ಕಾಲೇಜು ಆವರಣ ದ್ವಾರ', 14.7950, 75.4050);

    // Transport Operators
    const insertOp = db.prepare('INSERT INTO transport_operators (name, kannada_name, operator_type, depot) VALUES (?, ?, ?, ?)');
    insertOp.run('KSRTC / NWKRTC', 'ವಾಯವ್ಯ ಕರ್ನಾಟಕ ರಸ್ತೆ ಸಾರಿಗೆ ಸಂಸ್ಥೆ (NWKRTC)', 'government', 'Haveri Depot 1');
    insertOp.run('Haveri Student Shared Cruiser Union', 'ಹಾವೇರಿ ವಿದ್ಯಾರ್ಥಿ ಶೇರ್ಡ್ ಕ್ರೂಸರ್ ಯೂನಿಯನ್', 'private_shared', 'Byadgi Stand');
  }

  // Users check
  const userCheck = db.prepare("SELECT id FROM users WHERE email = 'sahana@routeless.ai'").get();
  if (!userCheck) {
    const passwordHash = bcrypt.hashSync('Password123!', 10);
    const insertUser = db.prepare(`
      INSERT INTO users (full_name, email, password_hash, role, phone_number, age_category, district, taluk, village, institution, landmark, nearest_stop, preferred_language, preferred_theme, usual_departure_time, preferred_arrival_time)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // 1. Sahana Gowda (Redesigned Frontend Hero Student)
    const sahana = insertUser.run(
      'Sahana Gowda',
      'sahana@routeless.ai',
      passwordHash,
      'student',
      '+91 98450 12890',
      '18-22',
      'Haveri',
      'Byadgi',
      'Motebennur',
      'Govt First Grade College, Haveri',
      'Near Motebennur Gram Panchayat',
      'Motebennur Gram Panchayat Circle',
      'kn',
      'light',
      '07:30 AM',
      '08:20 AM'
    );

    // 2. Driver Manjunath B.
    const driver = insertUser.run(
      'Manjunath B.',
      'driver.manju@routeless.ai',
      passwordHash,
      'driver',
      '+91 94480 33412',
      '35-50',
      'Haveri',
      'Byadgi',
      'Byadgi Town',
      'Haveri Shared Transit Union',
      'Near Byadgi APMC',
      'Byadgi KSRTC Bus Stand',
      'kn',
      'light',
      '07:15 AM',
      '08:30 AM'
    );

    // 3. Coordinator / Admin
    const admin = insertUser.run(
      'Prof. Basavaraj Patil',
      'admin.haveri@routeless.ai',
      passwordHash,
      'admin',
      '+91 94490 55678',
      '35-50',
      'Haveri',
      'Haveri',
      'Haveri City',
      'Haveri College Administration & Transit Wing',
      'DC Office Road',
      'Haveri Bus Stand',
      'kn',
      'light',
      '08:00 AM',
      '05:00 PM'
    );

    // 4. Parent
    insertUser.run(
      'Shivalingappa Gowda',
      'parent.gowda@routeless.ai',
      passwordHash,
      'parent',
      '+91 98450 99887',
      '50+',
      'Haveri',
      'Byadgi',
      'Motebennur',
      'Parent of Sahana Gowda',
      'Motebennur Main Street',
      'Motebennur Gram Panchayat Circle',
      'kn',
      'light',
      '07:30 AM',
      '08:30 AM'
    );

    // 5. Demo Student B — Kavita Patil (Dharwad)
    const student2 = insertUser.run(
      'Kavita Patil',
      'kavita@routeless.ai',
      passwordHash,
      'student',
      '+91 97441 23456',
      '18-22',
      'Dharwad',
      'Hubli',
      'Kalghatgi',
      'SDM College of Engineering, Dharwad',
      'Near Kalghatgi Bus Stand',
      'Kalghatgi KSRTC Stop',
      'kn',
      'light',
      '07:00 AM',
      '08:30 AM'
    );

    // 6. Demo Student C — Ravi Kumar (Belagavi)
    const student3 = insertUser.run(
      'Ravi Kumar M.',
      'ravi@routeless.ai',
      passwordHash,
      'student',
      '+91 96320 78901',
      '18-22',
      'Belagavi',
      'Gokak',
      'Gokak Town',
      'KLS Gogte Institute of Technology, Belagavi',
      'Gokak Bus Stand',
      'Gokak KSRTC Stand',
      'hi',
      'light',
      '07:15 AM',
      '08:45 AM'
    );

    // Vehicles
    const insertVeh = db.prepare(`
      INSERT INTO vehicles (provider_id, vehicle_name, vehicle_type, registration_number, total_seats, available_seats, verification_status, is_simulated_gps, current_lat, current_lng)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const v1 = insertVeh.run(
      driver.lastInsertRowid,
      'KSRTC ಗ್ರಾಮೀಣ ಎಕ್ಸ್‌ಪ್ರೆಸ್ #32',
      'ksrtc_bus',
      'KA-27-F-1102',
      45,
      14,
      'verified',
      1,
      14.7320,
      75.4520
    );

    const v2 = insertVeh.run(
      driver.lastInsertRowid,
      'ವಿದ್ಯಾರ್ಥಿ ಶೇರ್ಡ್ ಕ್ರೂಸರ್',
      'shared_cruiser',
      'KA-27-M-4421',
      10,
      3,
      'verified',
      1,
      14.7510,
      75.4650
    );

    const v3 = insertVeh.run(
      driver.lastInsertRowid,
      'ರೂಟ್‌ಲೆಸ್ಸ್ ಬ್ಯಾಕಪ್ ಮಿನಿಬಸ್',
      'shuttle',
      'KA-27-Q-8890',
      18,
      8,
      'verified',
      1,
      14.7700,
      75.4800
    );

    // Routes
    const insertRoute = db.prepare(`
      INSERT INTO routes (origin, destination, intermediate_stops, distance, estimated_duration, route_status, fare, operator_name, data_source)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const r1 = insertRoute.run(
      'ಬ್ಯಾಡಗಿ ನಿಲ್ದಾಣ (Byadgi Stand)',
      'ಕಾಲೇಜ್ ಗೇಟ್ (Haveri College Gate)',
      JSON.stringify(['ಬ್ಯಾಡಗಿ ಬಸ್ ನಿಲ್ದಾಣ', 'ಮೊಟೆಬೆನ್ನೂರು ಕ್ರಾಸ್', 'ಹಾವೇರಿ ಎಪಿಎಂಸಿ', 'ಕಾಲೇಜ್ ಆವರಣ']),
      '22 km',
      '35 ನಿಮಿಷ (35 mins)',
      'active',
      22,
      'NWKRTC / ಹಾವೇರಿ ಡಿಪೋ (Haveri Depot 1)',
      'Verified Official KSRTC Schedule'
    );

    const r2 = insertRoute.run(
      'ಗ್ರಾಮ ಪಂಚಾಯತಿ ಕ್ರಾಸ್ (Motebennur GP Cross)',
      'ಕಾಲೇಜು ಆವರಣ (Haveri College Compound Drop)',
      JSON.stringify(['ಮೊಟೆಬೆನ್ನೂರು ಪಂಚಾಯತ್', 'ಹಾವೇರಿ ಬೈಪಾಸ್ (Haveri Bypass)', 'ಕಾಲೇಜ್ ಕಾಂಪೌಂಡ್']),
      '18 km',
      '27 ನಿಮಿಷ (27 mins)',
      'active',
      15,
      'ಹಾವೇರಿ ಶೇರ್ಡ್ ಕ್ರೂಸರ್ ಯೂನಿಯನ್ (KA-27-M-4421)',
      'Live Verified Student Pool'
    );

    const r3 = insertRoute.run(
      'ಬ್ಯಾಡಗಿ ತಾಲೂಕು ಆಫೀಸ್ (Byadgi Taluk Office)',
      'ಕಾಲೇಜ್ ಮುಖ್ಯ ದ್ವಾರ (College Main Gate)',
      JSON.stringify(['ತಾಲೂಕು ಆಫೀಸ್', 'ಮೊಟೆಬೆನ್ನೂರು ಲಿಂಕ್', 'ಕಾಲೇಜ್ ಮುಖ್ಯ ದ್ವಾರ']),
      '20 km',
      '33 ನಿಮಿಷ (33 mins)',
      'active',
      10,
      'ರೂಟ್‌ಲೆಸ್ಸ್ ಪರೀಕ್ಷಾ ರಷ್ ಬ್ಯಾಕಪ್',
      'Emergency Autonomous Midterm Fallback'
    );

    // Shared Rides
    const insertRide = db.prepare(`
      INSERT INTO shared_rides (provider_id, route_id, vehicle_name, vehicle_number, departure_time, arrival_time, travel_date, total_seats, available_seats, price_per_seat, ride_status, compatibility_tag, driver_name)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const today = new Date().toISOString().split('T')[0];

    const ride1 = insertRide.run(
      driver.lastInsertRowid,
      r1.lastInsertRowid,
      'KSRTC ಗ್ರಾಮೀಣ ಎಕ್ಸ್‌ಪ್ರೆಸ್ #32',
      'KA-27-F-1102',
      '07:45 AM',
      '08:20 AM',
      today,
      45,
      14,
      22,
      'scheduled',
      'ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ • TOP CHOICE • On Time',
      'KSRTC ಚಾಲಕ ಸಿಬ್ಬಂದಿ'
    );

    const ride2 = insertRide.run(
      driver.lastInsertRowid,
      r2.lastInsertRowid,
      'ವಿದ್ಯಾರ್ಥಿ ಶೇರ್ಡ್ ಕ್ರೂಸರ್',
      'KA-27-M-4421',
      '07:55 AM',
      '08:22 AM',
      today,
      10,
      3,
      15,
      'scheduled',
      'ವೇಗದ ಮಾರ್ಗ • 8 MINS FASTER • 4.9★',
      'ಮಂಜುನಾಥ್ ಬಿ.'
    );

    const ride3 = insertRide.run(
      driver.lastInsertRowid,
      r3.lastInsertRowid,
      'ರೂಟ್‌ಲೆಸ್ಸ್ ಬ್ಯಾಕಪ್ ಮಿನಿಬಸ್',
      'KA-27-Q-8890',
      '08:05 AM',
      '08:38 AM',
      today,
      18,
      8,
      10,
      'scheduled',
      'ಪರೀಕ್ಷಾ ರಷ್ ಬ್ಯಾಕಪ್ • FALLBACK • Subsidized',
      'ಆಡಳಿತ ಸ್ವಯಂ-ನಿಯೋಜನೆ'
    );

    // Ride Bookings for Sahana (Matches screen 4 & 6)
    const insertBooking = db.prepare(`
      INSERT INTO ride_bookings (ride_id, student_id, seats_requested, booking_status, fare_paid, pickup_stop, dropoff_stop, pass_verified)
      VALUES (?, ?, ?, 'confirmed', ?, ?, ?, 1)
    `);

    insertBooking.run(
      ride1.lastInsertRowid,
      sahana.lastInsertRowid,
      1,
      0, // Free with student pass
      'ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ 2B, ಬ್ಯಾಡಗಿ ನಿಲ್ದಾಣ',
      'ಕಾಲೇಜ್ ಗೇಟ್'
    );

    insertBooking.run(
      ride2.lastInsertRowid,
      sahana.lastInsertRowid,
      1,
      15,
      'ಗ್ರಾಮ ಪಂಚಾಯತಿ ಕ್ರಾಸ್',
      'ಕಾಲೇಜು ಆವರಣ'
    );

    // Pickup Request (Bus Stop on Demand)
    const insertPickup = db.prepare(`
      INSERT INTO pickup_requests (student_id, district, taluk, village, landmark, destination, travel_date, preferred_time, passenger_count, comments, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertPickup.run(
      sahana.lastInsertRowid,
      'Haveri',
      'Byadgi',
      'Motebennur',
      'Motebennur Lake Cross Road Junction',
      'Govt First Grade College, Haveri',
      today,
      '07:30 AM',
      6,
      'ವಿದ್ಯಾರ್ಥಿಗಳು ಹೆದ್ದಾರಿ ತಲುಪಲು 3.8 ಕಿ.ಮೀ ನಡೆದುಕೊಂಡು ಹೋಗಬೇಕಾಗಿದೆ. ದಯವಿಟ್ಟು ಇಲ್ಲಿ ಪಿಕಪ್ ಸ್ಟಾಪ್ ನೀಡಿ.',
      'pending'
    );

    // Notifications
    const insertNotif = db.prepare(`
      INSERT INTO notifications (user_id, title, message, notification_type)
      VALUES (?, ?, ?, ?)
    `);

    insertNotif.run(
      sahana.lastInsertRowid,
      'ಸೀಟ್ ದೃಢಪಟ್ಟಿದೆ / Seat Confirmed',
      'KSRTC ಗ್ರಾಮೀಣ ಎಕ್ಸ್‌ಪ್ರೆಸ್ #32 ರಲ್ಲಿ ನಿಮ್ಮ ಸೀಟ್ ದೃಢಪಟ್ಟಿದೆ. ಹೊರಡುವ ಸಮಯ: 07:45 AM ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ 2B.',
      'booking'
    );

    insertNotif.run(
      sahana.lastInsertRowid,
      'ಶೇರ್ಡ್ ಕ್ರೂಸರ್ ಅಪ್‌ಡೇಟ್ / Pool Update',
      'ಚಾಲಕ ಮಂಜುನಾಥ್ ಬಿ. (KA-27-M-4421) ಅವರ ಕ್ರೂಸರ್ 07:55 AM ಕ್ಕೆ ಗ್ರಾಮ ಪಂಚಾಯತಿ ಕ್ರಾಸ್ ತಲುಪಲಿದೆ.',
      'match'
    );

    console.log('Karnataka rural mobility pilot database seeded successfully!');
  }
}

module.exports = { seedDatabase, KARNATAKA_DISTRICTS };
