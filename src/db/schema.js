const db = require('./database');

function initSchema() {
  db.exec(`
    -- Karnataka Location Hierarchy
    CREATE TABLE IF NOT EXISTS districts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      kannada_name TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS taluks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      district_id INTEGER NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      kannada_name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS villages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      taluk_id INTEGER NOT NULL REFERENCES taluks(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      kannada_name TEXT NOT NULL,
      panchayat TEXT
    );

    CREATE TABLE IF NOT EXISTS institutions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      taluk_id INTEGER NOT NULL REFERENCES taluks(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      kannada_name TEXT NOT NULL,
      institution_type TEXT DEFAULT 'college' -- 'school', 'puc', 'college', 'engineering'
    );

    CREATE TABLE IF NOT EXISTS bus_stops (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      taluk_id INTEGER REFERENCES taluks(id),
      village_id INTEGER REFERENCES villages(id),
      name TEXT NOT NULL,
      kannada_name TEXT NOT NULL,
      latitude REAL,
      longitude REAL
    );

    CREATE TABLE IF NOT EXISTS transport_operators (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      kannada_name TEXT NOT NULL,
      operator_type TEXT DEFAULT 'government' CHECK (operator_type IN ('government', 'private_shared', 'institutional')),
      depot TEXT
    );

    -- Users with Karnataka Rural Profile & Theme preferences
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'parent', 'driver', 'admin')),
      phone_number TEXT,
      age_category TEXT DEFAULT '18-22',
      district TEXT DEFAULT 'Haveri',
      taluk TEXT DEFAULT 'Byadgi',
      village TEXT DEFAULT 'Motebennur',
      institution TEXT DEFAULT 'Govt First Grade College, Haveri',
      landmark TEXT,
      nearest_stop TEXT DEFAULT 'Motebennur Gram Panchayat Circle',
      preferred_language TEXT DEFAULT 'kn' CHECK (preferred_language IN ('kn', 'en', 'hi', 'te', 'ta', 'ml')),
      preferred_theme TEXT DEFAULT 'light' CHECK (preferred_theme IN ('light', 'dark', 'system')),
      usual_departure_time TEXT DEFAULT '07:30 AM',
      preferred_arrival_time TEXT DEFAULT '08:30 AM',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      provider_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      operator_id INTEGER REFERENCES transport_operators(id),
      vehicle_name TEXT NOT NULL,
      vehicle_type TEXT NOT NULL DEFAULT 'shuttle' CHECK (vehicle_type IN ('ksrtc_bus', 'shared_cruiser', 'shuttle', 'van', 'bus', 'bolero_carpool')),
      registration_number TEXT NOT NULL UNIQUE,
      total_seats INTEGER NOT NULL,
      available_seats INTEGER NOT NULL,
      verification_status TEXT DEFAULT 'verified' CHECK (verification_status IN ('verified', 'pending', 'suspended')),
      is_simulated_gps INTEGER DEFAULT 1,
      current_lat REAL DEFAULT 14.7950,
      current_lng REAL DEFAULT 75.4850,
      last_location_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS routes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      origin TEXT NOT NULL,
      destination TEXT NOT NULL,
      intermediate_stops TEXT DEFAULT '[]',
      distance TEXT NOT NULL,
      estimated_duration TEXT NOT NULL,
      route_status TEXT DEFAULT 'active' CHECK (route_status IN ('active', 'disrupted', 'delayed')),
      fare INTEGER DEFAULT 15,
      operator_name TEXT DEFAULT 'KSRTC / NWKRTC',
      data_source TEXT DEFAULT 'Verified Official KSRTC Schedule',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS shared_rides (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      provider_id INTEGER REFERENCES users(id),
      route_id INTEGER NOT NULL REFERENCES routes(id),
      vehicle_name TEXT NOT NULL,
      vehicle_number TEXT NOT NULL,
      departure_time TEXT NOT NULL,
      arrival_time TEXT DEFAULT '08:25 AM',
      travel_date TEXT NOT NULL,
      total_seats INTEGER NOT NULL,
      available_seats INTEGER NOT NULL,
      price_per_seat INTEGER DEFAULT 15,
      ride_status TEXT DEFAULT 'scheduled' CHECK (ride_status IN ('scheduled', 'in_transit', 'completed', 'cancelled')),
      compatibility_tag TEXT DEFAULT 'Top Choice • On Time',
      driver_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ride_bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ride_id INTEGER NOT NULL REFERENCES shared_rides(id) ON DELETE CASCADE,
      student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      seats_requested INTEGER DEFAULT 1,
      booking_status TEXT DEFAULT 'confirmed' CHECK (booking_status IN ('confirmed', 'cancelled', 'completed')),
      fare_paid INTEGER DEFAULT 15,
      pickup_stop TEXT,
      dropoff_stop TEXT,
      pass_verified INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Bus Stop on Demand Requests
    CREATE TABLE IF NOT EXISTS pickup_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      district TEXT NOT NULL DEFAULT 'Haveri',
      taluk TEXT NOT NULL DEFAULT 'Byadgi',
      village TEXT NOT NULL,
      landmark TEXT NOT NULL,
      destination TEXT NOT NULL,
      travel_date TEXT NOT NULL,
      preferred_time TEXT NOT NULL,
      passenger_count INTEGER DEFAULT 1,
      comments TEXT,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Community Road Intelligence
    CREATE TABLE IF NOT EXISTS community_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      report_type TEXT NOT NULL CHECK (report_type IN ('blockage', 'damaged_road', 'flooding', 'unsafe_pickup', 'disruption')),
      location TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT DEFAULT 'reported' CHECK (status IN ('reported', 'verified', 'resolved')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      notification_type TEXT DEFAULT 'system' CHECK (notification_type IN ('booking', 'disruption', 'system', 'match', 'pickup')),
      read_status INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Email verification tokens
    CREATE TABLE IF NOT EXISTS email_verifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token TEXT NOT NULL UNIQUE,
      expires_at DATETIME NOT NULL,
      used INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Password reset tokens
    CREATE TABLE IF NOT EXISTS password_resets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token TEXT NOT NULL UNIQUE,
      expires_at DATETIME NOT NULL,
      used INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Student digital passes with QR
    CREATE TABLE IF NOT EXISTS student_passes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      pass_number TEXT NOT NULL UNIQUE,
      qr_token TEXT NOT NULL UNIQUE,
      student_name TEXT NOT NULL,
      institution TEXT NOT NULL,
      district TEXT NOT NULL,
      village TEXT NOT NULL,
      course TEXT DEFAULT 'General',
      class_year TEXT DEFAULT '1st Year',
      status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked', 'pending')),
      issue_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      expiry_date DATETIME,
      is_verified INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Pass verification events log
    CREATE TABLE IF NOT EXISTS pass_verification_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pass_id INTEGER NOT NULL REFERENCES student_passes(id) ON DELETE CASCADE,
      qr_token TEXT NOT NULL,
      verified_by INTEGER REFERENCES users(id),
      result TEXT NOT NULL CHECK (result IN ('valid', 'expired', 'invalid', 'revoked', 'unverified')),
      location TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- AI conversation threads
    CREATE TABLE IF NOT EXISTS ai_conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      session_id TEXT NOT NULL,
      language TEXT DEFAULT 'en',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- AI conversation messages
    CREATE TABLE IF NOT EXISTS ai_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id INTEGER NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
      role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
      content TEXT NOT NULL,
      intent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Emergency scenarios
    CREATE TABLE IF NOT EXISTS emergency_scenarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      scenario_type TEXT DEFAULT 'exam_day',
      status TEXT DEFAULT 'inactive' CHECK (status IN ('inactive', 'active', 'resolved')),
      unavailable_buses TEXT DEFAULT '[]',
      demand_increase_percent INTEGER DEFAULT 40,
      blocked_roads TEXT DEFAULT '[]',
      affected_students INTEGER DEFAULT 0,
      is_simulation INTEGER DEFAULT 1,
      created_by INTEGER REFERENCES users(id),
      activated_at DATETIME,
      resolved_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Emergency allocations
    CREATE TABLE IF NOT EXISTS emergency_allocations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      scenario_id INTEGER NOT NULL REFERENCES emergency_scenarios(id) ON DELETE CASCADE,
      student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      vehicle_id INTEGER REFERENCES vehicles(id),
      priority INTEGER DEFAULT 5,
      has_exam INTEGER DEFAULT 0,
      exam_time TEXT,
      allocation_status TEXT DEFAULT 'pending' CHECK (allocation_status IN ('pending', 'allocated', 'in_transit', 'delivered', 'missed')),
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Road blockages
    CREATE TABLE IF NOT EXISTS road_blockages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      scenario_id INTEGER REFERENCES emergency_scenarios(id) ON DELETE CASCADE,
      road_name TEXT NOT NULL,
      from_location TEXT NOT NULL,
      to_location TEXT NOT NULL,
      reason TEXT DEFAULT 'flooding',
      status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cleared')),
      reported_by INTEGER REFERENCES users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Demand predictions
    CREATE TABLE IF NOT EXISTS demand_predictions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      district TEXT NOT NULL,
      taluk TEXT,
      prediction_date TEXT NOT NULL,
      day_type TEXT DEFAULT 'weekday',
      expected_students INTEGER NOT NULL,
      available_capacity INTEGER NOT NULL,
      shortage INTEGER DEFAULT 0,
      confidence TEXT DEFAULT 'medium',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_district ON users(district);
    CREATE INDEX IF NOT EXISTS idx_rides_route ON shared_rides(route_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_user ON ride_bookings(student_id);
    CREATE INDEX IF NOT EXISTS idx_pickups_status ON pickup_requests(status);
    CREATE INDEX IF NOT EXISTS idx_passes_user ON student_passes(user_id);
    CREATE INDEX IF NOT EXISTS idx_passes_qr ON student_passes(qr_token);
    CREATE INDEX IF NOT EXISTS idx_ai_conv_user ON ai_conversations(user_id);
    CREATE INDEX IF NOT EXISTS idx_ai_msg_conv ON ai_messages(conversation_id);
  `);

  // Add preferred_theme column if missing (migration for existing DBs)
  try {
    db.exec(`ALTER TABLE users ADD COLUMN preferred_theme TEXT DEFAULT 'light' CHECK (preferred_theme IN ('light', 'dark', 'system'))`);
  } catch (e) { /* column already exists */ }

  // Add age_category column if missing
  try {
    db.exec(`ALTER TABLE users ADD COLUMN age_category TEXT DEFAULT '18-22'`);
  } catch (e) { /* column already exists */ }

  console.log('Routeless Karnataka database schema verified.');
}

module.exports = { initSchema };
