const db = require('../db/database');

function getNotifications(req, res) {
  try {
    const userId = req.user.id;
    const notifications = db.prepare(`
      SELECT * FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 20
    `).all(userId);

    const unreadCount = db.prepare(`
      SELECT COUNT(*) as count FROM notifications
      WHERE user_id = ? AND read_status = 0
    `).get(userId).count;

    return res.json({
      success: true,
      unread_count: unreadCount,
      notifications
    });
  } catch (err) {
    console.error('Get notifications error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve notifications.' });
  }
}

function markAsRead(req, res) {
  try {
    const notificationId = req.params.id;
    const userId = req.user.id;

    db.prepare('UPDATE notifications SET read_status = 1 WHERE id = ? AND user_id = ?').run(notificationId, userId);

    return res.json({ success: true, message: 'Notification marked as read.' });
  } catch (err) {
    console.error('Mark notification read error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update notification.' });
  }
}

module.exports = {
  getNotifications,
  markAsRead
};

