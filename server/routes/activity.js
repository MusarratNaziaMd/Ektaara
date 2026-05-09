const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getActivities } = require('../controllers/activityController');

router.use(protect);
router.get('/', getActivities);

module.exports = router;
