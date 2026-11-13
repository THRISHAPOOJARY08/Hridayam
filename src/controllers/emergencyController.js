const db = require('../db/database');

// GET /api/emergency/status
function getStatus(req, res) {
  try {
    const scenario = db.prepare(
      "SELECT * FROM emergency_scenarios WHERE status = 'active' ORDER BY activated_at DESC LIMIT 1"
    ).get();

    if (!scenario) {
      return res.json({
        success: true,
        active: false,
        message: 'No active emergency scenario.'
      });
    }

    const allocations = db.prepare(`
      SELECT ea.*, u.full_name, u.village, u.institution, v.vehicle_name, v.registration_number
      FROM emergency_allocations ea
      JOIN users u ON ea.student_id = u.id
      LEFT JOIN vehicles v ON ea.vehicle_id = v.id
      WHERE ea.scenario_id = ?
      ORDER BY ea.priority ASC
    `).all(scenario.id);

    const blockages = db.prepare(
      "SELECT * FROM road_blockages WHERE scenario_id = ? AND status = 'active'"
    ).all(scenario.id);

    const vehicles = db.prepare("SELECT * FROM vehicles WHERE verification_status = 'verified'").all();

    const unavailableBuses = JSON.parse(scenario.unavailable_buses || '[]');
    const availableVehicles = vehicles.filter(v => !unavailableBuses.includes(v.id.toString()));
    const totalCapacity = availableVehicles.reduce((sum, v) => sum + v.available_seats, 0);
    const studentsAllocated = allocations.filter(a => a.allocation_status === 'allocated').length;
    const studentsWaiting = allocations.filter(a => a.allocation_status === 'pending').length;
    const examStudents = allocations.filter(a => a.has_exam === 1).length;

    return res.json({
      success: true,
      active: true,
      scenario: {
        id: scenario.id,
        title: scenario.title,
        description: scenario.description,
        status: scenario.status,
        is_simulation: scenario.is_simulation === 1,
        demand_increase_percent: scenario.demand_increase_percent,
        affected_students: scenario.affected_students,
        activated_at: scenario.activated_at
      },
      summary: {
        total_vehicles: vehicles.length,
        unavailable_buses: unavailableBuses.length,
        available_vehicles: availableVehicles.length,
        total_available_capacity: totalCapacity,
        total_students_affected: allocations.length,
        students_with_exams: examStudents,
        students_allocated: studentsAllocated,
        students_waiting: studentsWaiting
      },
      allocations,
      road_blockages: blockages
    });
  } catch (err) {
    console.error('Emergency status error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve emergency status.' });
  }
}

// POST /api/emergency/simulate  (admin)
function simulate(req, res) {
  try {
    // Reset any existing simulation
    db.prepare("UPDATE emergency_scenarios SET status = 'resolved', resolved_at = CURRENT_TIMESTAMP WHERE is_simulation = 1 AND status = 'active'").run();
    db.prepare("DELETE FROM emergency_allocations WHERE scenario_id IN (SELECT id FROM emergency_scenarios WHERE is_simulation = 1)").run();
    db.prepare("DELETE FROM road_blockages WHERE scenario_id IN (SELECT id FROM emergency_scenarios WHERE is_simulation = 1 AND status = 'resolved')").run();

    const vehicles = db.prepare("SELECT * FROM vehicles WHERE verification_status = 'verified'").all();
    if (vehicles.length < 2) {
      return res.status(400).json({ success: false, error: 'Need at least 2 vehicles for simulation.' });
    }

    // Pick 2 buses to mark unavailable
    const unavailableBusIds = vehicles.slice(0, 2).map(v => v.id.toString());

    // Create emergency scenario
    const result = db.prepare(`
      INSERT INTO emergency_scenarios
        (title, description, scenario_type, status, unavailable_buses, demand_increase_percent, is_simulation, affected_students, activated_at)
      VALUES (?, ?, 'exam_day', 'active', ?, 40, 1, 0, CURRENT_TIMESTAMP)
    `).run(
      '⚠️ EXAM DAY EMERGENCY [SIMULATION]',
      '2 government buses unavailable. Demand +40%. Road flooding between Motebennur and Byadgi. Students have examinations within 2 hours.',
      JSON.stringify(unavailableBusIds)
    );

    const scenarioId = result.lastInsertRowid;

    // Add road blockage
    db.prepare(`
      INSERT INTO road_blockages (scenario_id, road_name, from_location, to_location, reason, status)
      VALUES (?, 'Motebennur–Byadgi Rural Road', 'Motebennur', 'Byadgi', 'flooding', 'active')
    `).run(scenarioId);

    // Add simulated affected students with exam times
    const students = db.prepare("SELECT * FROM users WHERE role = 'student' LIMIT 10").all();
    const examTimes = ['09:00 AM', '09:00 AM', '10:00 AM', '10:30 AM', '11:00 AM', null, null, null, null, null];
    const availableVehicles = vehicles.filter(v => !unavailableBusIds.includes(v.id.toString()));

    students.forEach((student, idx) => {
      const hasExam = idx < 5 ? 1 : 0;
      const examTime = examTimes[idx] || null;
      // Priority: 1 = earliest exam, 5 = no exam
      const priority = hasExam ? idx + 1 : 5 + idx;
      const vehicle = availableVehicles[idx % availableVehicles.length];

      db.prepare(`
        INSERT INTO emergency_allocations
          (scenario_id, student_id, vehicle_id, priority, has_exam, exam_time, allocation_status, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        scenarioId,
        student.id,
        vehicle ? vehicle.id : null,
        priority,
        hasExam,
        examTime,
        hasExam ? 'allocated' : 'pending',
        hasExam ? `PRIORITY: Exam at ${examTime} - Alternative route via Shiggaon NH48` : 'Standard allocation pending'
      );
    });

    // Update affected count
    db.prepare('UPDATE emergency_scenarios SET affected_students = ? WHERE id = ?').run(students.length, scenarioId);

    return res.json({
      success: true,
      message: '[SIMULATION] Emergency exam-day scenario activated.',
      is_simulation: true,
      scenario_id: scenarioId,
      unavailable_buses: unavailableBusIds,
      blocked_road: 'Motebennur–Byadgi Rural Road (flooding)',
      students_affected: students.length,
      students_with_exams: 5
    });
  } catch (err) {
    console.error('Emergency simulate error:', err);
    return res.status(500).json({ success: false, error: 'Failed to start simulation.' });
  }
}

// POST /api/emergency/reset  (admin)
function resetSimulation(req, res) {
  try {
    db.prepare("UPDATE emergency_scenarios SET status = 'resolved', resolved_at = CURRENT_TIMESTAMP WHERE is_simulation = 1").run();
    db.prepare("UPDATE road_blockages SET status = 'cleared' WHERE scenario_id IN (SELECT id FROM emergency_scenarios WHERE is_simulation = 1)").run();
    db.prepare("UPDATE emergency_allocations SET allocation_status = 'pending' WHERE scenario_id IN (SELECT id FROM emergency_scenarios WHERE is_simulation = 1)").run();

    return res.json({ success: true, message: 'Simulation reset. All demo data restored.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to reset simulation.' });
  }
}

// POST /api/emergency/allocate  (admin - runs allocation algorithm)
function runAllocation(req, res) {
  try {
    const scenario = db.prepare("SELECT * FROM emergency_scenarios WHERE status = 'active' AND is_simulation = 1 ORDER BY created_at DESC LIMIT 1").get();
    if (!scenario) return res.status(404).json({ success: false, error: 'No active simulation found.' });

    const unavailableBusIds = JSON.parse(scenario.unavailable_buses || '[]');
    const vehicles = db.prepare("SELECT * FROM vehicles WHERE verification_status = 'verified'").all();
    const availableVehicles = vehicles.filter(v => !unavailableBusIds.includes(v.id.toString()));

    // Get all allocations sorted by priority
    const allocations = db.prepare(`
      SELECT ea.*, u.full_name, u.village
      FROM emergency_allocations ea
      JOIN users u ON ea.student_id = u.id
      WHERE ea.scenario_id = ?
      ORDER BY ea.priority ASC, ea.has_exam DESC
    `).all(scenario.id);

    let vehicleCapacities = {};
    availableVehicles.forEach(v => {
      vehicleCapacities[v.id] = v.available_seats;
    });

    const results = { allocated: [], waiting: [] };

    allocations.forEach(alloc => {
      let assigned = false;
      for (const v of availableVehicles) {
        if ((vehicleCapacities[v.id] || 0) > 0) {
          db.prepare(`
            UPDATE emergency_allocations
            SET vehicle_id = ?, allocation_status = 'allocated', notes = ?
            WHERE id = ?
          `).run(v.id, `Allocated to ${v.vehicle_name} (${v.registration_number}) - Alternative route via NH48`, alloc.id);
          vehicleCapacities[v.id]--;
          results.allocated.push({ student: alloc.full_name, vehicle: v.vehicle_name, has_exam: alloc.has_exam });
          assigned = true;
          break;
        }
      }
      if (!assigned) {
        db.prepare("UPDATE emergency_allocations SET allocation_status = 'pending', notes = ? WHERE id = ?")
          .run('No capacity available. On waiting list.', alloc.id);
        results.waiting.push({ student: alloc.full_name, has_exam: alloc.has_exam });
      }
    });

    return res.json({
      success: true,
      message: 'Emergency allocation completed.',
      results,
      summary: {
        allocated: results.allocated.length,
        waiting: results.waiting.length,
        exam_students_allocated: results.allocated.filter(a => a.has_exam).length,
        exam_students_waiting: results.waiting.filter(a => a.has_exam).length
      }
    });
  } catch (err) {
    console.error('Allocation error:', err);
    return res.status(500).json({ success: false, error: 'Allocation algorithm failed.' });
  }
}

module.exports = { getStatus, simulate, resetSimulation, runAllocation };
