const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/role');
const {
  getProjects, getProject, createProject,
  updateProject, deleteProject, addMember, removeMember
} = require('../controllers/projectController');

router.use(protect);

router.get('/', getProjects);
router.get('/:id', getProject);
router.post('/', isAdmin, createProject);
router.put('/:id', isAdmin, updateProject);
router.delete('/:id', isAdmin, deleteProject);
router.post('/:id/members', isAdmin, addMember);
router.delete('/:id/members/:userId', isAdmin, removeMember);

module.exports = router;
