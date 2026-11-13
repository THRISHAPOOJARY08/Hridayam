-- ROUTELESS: THE LAST MILE
-- PostgreSQL / Supabase Relational Database Schema

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'driver', 'admin')),
  phone_number VARCHAR(50),
  village VARCHAR(255),
  institution VARCHAR(255),
  preferred_language VARCHAR(10) DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vehicles (
  id SERIAL PRIMARY KEY,
  provider_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vehicle_name VARCHAR(255) NOT NULL,
  vehicle_type VARCHAR(50) NOT NULL DEFAULT 'shuttle' CHECK (vehicle_type IN ('bus', 'shuttle', 'bolero_carpool', 'van')),
  registration_number VARCHAR(100) NOT NULL UNIQUE,
  total_seats INTEGER NOT NULL,
  available_seats INTEGER NOT NULL,
  verification_status VARCHAR(50) DEFAULT 'verified' CHECK (verification_status IN ('verified', 'pending', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS routes (
  id SERIAL PRIMARY KEY,
  origin VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  intermediate_stops JSONB DEFAULT '[]',
  distance VARCHAR(50) NOT NULL,
  estimated_duration VARCHAR(50) NOT NULL,
  route_status VARCHAR(50) DEFAULT 'active' CHECK (route_status IN ('active', 'disrupted', 'delayed')),
  fare INTEGER DEFAULT 15,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transport_requests (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  origin VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  travel_date DATE NOT NULL,
  preferred_time VARCHAR(50) NOT NULL,
  passenger_count INTEGER DEFAULT 1,
  request_status VARCHAR(50) DEFAULT 'pending' CHECK (request_status IN ('pending', 'matched', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shared_rides (
  id SERIAL PRIMARY KEY,
  provider_id INTEGER NOT NULL REFERENCES users(id),
  route_id INTEGER NOT NULL REFERENCES routes(id),
  vehicle_name VARCHAR(255) NOT NULL,
  vehicle_number VARCHAR(100) NOT NULL,
  departure_time VARCHAR(50) NOT NULL,
  travel_date DATE NOT NULL,
  total_seats INTEGER NOT NULL,
  available_seats INTEGER NOT NULL,
  price_per_seat INTEGER DEFAULT 15,
  ride_status VARCHAR(50) DEFAULT 'scheduled' CHECK (ride_status IN ('scheduled', 'in_transit', 'completed', 'cancelled')),
  compatibility_tag VARCHAR(100) DEFAULT 'High Compatibility',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ride_bookings (
  id SERIAL PRIMARY KEY,
  ride_id INTEGER NOT NULL REFERENCES shared_rides(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seats_requested INTEGER DEFAULT 1,
  booking_status VARCHAR(50) DEFAULT 'confirmed' CHECK (booking_status IN ('confirmed', 'cancelled', 'completed')),
  fare_paid INTEGER DEFAULT 15,
  pickup_stop VARCHAR(255),
  dropoff_stop VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  notification_type VARCHAR(50) DEFAULT 'system' CHECK (notification_type IN ('booking', 'disruption', 'system', 'match')),
  read_status INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS demand_petitions (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES users(id),
  stop_name VARCHAR(255) NOT NULL,
  village VARCHAR(255) NOT NULL,
  corridor VARCHAR(255) NOT NULL,
  nearby_students_count INTEGER DEFAULT 1,
  petition_status VARCHAR(50) DEFAULT 'pending' CHECK (petition_status IN ('pending', 'approved', 'rejected')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS disruptions (
  id SERIAL PRIMARY KEY,
  route_id INTEGER REFERENCES routes(id),
  title VARCHAR(255) NOT NULL,
  corridor VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  severity VARCHAR(50) DEFAULT 'critical' CHECK (severity IN ('critical', 'moderate', 'resolved')),
  status VARCHAR(50) DEFAULT 'active',
  fallback_shuttles_deployed INTEGER DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

