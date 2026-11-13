const db = require('../db/database');
const { KARNATAKA_DISTRICTS } = require('../db/seed');

function getDistricts(req, res) {
  try {
    const districts = db.prepare('SELECT * FROM districts ORDER BY name ASC').all();
    return res.json({
      success: true,
      total_districts: districts.length,
      districts: districts.length > 0 ? districts : KARNATAKA_DISTRICTS
    });
  } catch (err) {
    console.error('Get districts error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve Karnataka districts.' });
  }
}

function getTaluks(req, res) {
  try {
    const { district } = req.query;
    let query = 'SELECT t.*, d.name as district_name FROM taluks t JOIN districts d ON t.district_id = d.id';
    let params = [];

    if (district) {
      query += ' WHERE LOWER(d.name) = LOWER(?) OR LOWER(d.kannada_name) = LOWER(?)';
      params.push(district, district);
    }

    query += ' ORDER BY t.name ASC';
    const taluks = db.prepare(query).all(...params);

    return res.json({ success: true, count: taluks.length, taluks });
  } catch (err) {
    console.error('Get taluks error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve taluks.' });
  }
}

function getVillages(req, res) {
  try {
    const { taluk } = req.query;
    let query = 'SELECT v.*, t.name as taluk_name FROM villages v JOIN taluks t ON v.taluk_id = t.id';
    let params = [];

    if (taluk) {
      query += ' WHERE LOWER(t.name) = LOWER(?) OR LOWER(t.kannada_name) = LOWER(?)';
      params.push(taluk, taluk);
    }

    const villages = db.prepare(query).all(...params);
    return res.json({ success: true, count: villages.length, villages });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve villages.' });
  }
}

function getInstitutions(req, res) {
  try {
    const institutions = db.prepare('SELECT * FROM institutions ORDER BY name ASC').all();
    return res.json({ success: true, count: institutions.length, institutions });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve institutions.' });
  }
}

function getBusStops(req, res) {
  try {
    const stops = db.prepare('SELECT * FROM bus_stops ORDER BY name ASC').all();
    return res.json({ success: true, count: stops.length, stops });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve bus stops.' });
  }
}

module.exports = {
  getDistricts,
  getTaluks,
  getVillages,
  getInstitutions,
  getBusStops
};

