const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/role');
const {
  getTasks, getTask, createTask,
  updateTask, deleteTask, reorderTasks
} = require('../controllers/taskController');

router.use(protect);

router.get('/', getTasks);
router.get('/:id', getTask);
router.post('/', isAdmin, createTask);
router.put('/reorder', reorderTasks);
router.put('/:id', updateTask);
router.delete('/:id', isAdmin, deleteTask);

module.exports = router;
