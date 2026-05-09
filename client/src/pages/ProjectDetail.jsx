import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Calendar, Users, Activity } from 'lucide-react';
import { getProject, getTasks, createTask, updateTask, deleteTask, reorderTasks, addMember, removeMember, getActivities } from '../services/auth';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import toast from 'react-hot-toast';
import { CardSkeleton } from '../components/ui/Skeleton';
import KanbanBoard from '../components/tasks/KanbanBoard';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import { formatDate, formatRelativeTime } from '../lib/dateUtils';
import { PROJECT_STATUS } from '../lib/constants';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'medium', assignedTo: '', dueDate: '', labels: '' });
  const [memberEmail, setMemberEmail] = useState('');
  const [creating, setCreating] = useState(false);
  const [addingMember, setAddingMember] = useState(false);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (socket && id) {
      socket.emit('join:project', id);
      return () => { socket.emit('leave:project', id); };
    }
  }, [socket, id]);

  useEffect(() => {
    if (socket) {
      const handleTaskUpdate = () => { fetchTasks(); fetchActivities(); };
      socket.on('task:created', handleTaskUpdate);
      socket.on('task:updated', handleTaskUpdate);
      socket.on('task:moved', handleTaskUpdate);
      socket.on('project:updated', fetchProject);
      return () => {
        socket.off('task:created', handleTaskUpdate);
        socket.off('task:updated', handleTaskUpdate);
        socket.off('task:moved', handleTaskUpdate);
        socket.off('project:updated', fetchProject);
      };
    }
  }, [socket]);

  const fetchProject = useCallback(async () => {
    try {
      const { data } = await getProject(id);
      setProject(data.data.project);
    } catch {
      toast.error('Project not found');
      navigate('/projects');
    }
  }, [id, navigate]);

  const fetchTasks = useCallback(async () => {
    try {
      const { data } = await getTasks({ projectId: id });
      setTasks(data.data.tasks);
    } catch {}
  }, [id]);

  const fetchActivities = useCallback(async () => {
    try {
      const { data } = await getActivities({ projectId: id, limit: 10 });
      setActivities(data.data.activities);
    } catch {}
  }, [id]);

  useEffect(() => {
    Promise.all([fetchProject(), fetchTasks(), fetchActivities()]).finally(() => setLoading(false));
  }, [fetchProject, fetchTasks, fetchActivities]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await createTask({
        ...taskForm,
        projectId: id,
        labels: taskForm.labels ? taskForm.labels.split(',').map(l => l.trim()).filter(Boolean) : [],
      });
      toast.success('Task created');
      setShowCreateTask(false);
      setTaskForm({ title: '', description: '', priority: 'medium', assignedTo: '', dueDate: '', labels: '' });
      fetchTasks();
      fetchActivities();
      if (socket) socket.emit('task:created', { projectId: id });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateTask = async (taskId, data) => {
    const { data: res } = await updateTask(taskId, data);
    fetchTasks();
    fetchActivities();
    if (socket) socket.emit('task:updated', { projectId: id });
    return res;
  };

  const handleDeleteTask = async (taskId) => {
    await deleteTask(taskId);
    fetchTasks();
    fetchActivities();
    if (socket) socket.emit('task:updated', { projectId: id });
  };

  const handleReorder = async (reorderedTasks) => {
    setTasks(reorderedTasks);
    try {
      const payload = reorderedTasks.map(t => ({ _id: t._id, status: t.status, order: t.order }));
      await reorderTasks({ tasks: payload });
      if (socket) socket.emit('task:moved', { projectId: id });
    } catch {
      fetchTasks();
      toast.error('Failed to reorder');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setAddingMember(true);
    try {
      await addMember(id, { email: memberEmail });
      toast.success('Member added');
      setShowAddMember(false);
      setMemberEmail('');
      fetchProject();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      await removeMember(id, userId);
      toast.success('Member removed');
      fetchProject();
    } catch {
      toast.error('Failed to remove member');
    }
  };

  if (loading) return (
    <div className="space-y-4">
      <CardSkeleton />
      <CardSkeleton />
    </div>
  );

  if (!project) return null;

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/projects')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Projects
      </button>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{project.title}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${PROJECT_STATUS[project.status]?.color || ''}`}>
                {PROJECT_STATUS[project.status]?.label || project.status}
              </span>
            </div>
            {project.description && (
              <p className="text-gray-500 dark:text-gray-400">{project.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <span>Deadline: {project.deadline ? formatDate(project.deadline) : 'Not set'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            <span>{project.members?.length || 0} members</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Team Members</h3>
            {isAdmin && (
              <Button variant="ghost" size="sm" onClick={() => setShowAddMember(true)}>
                <Plus className="w-4 h-4" /> Add
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            {project.members?.map(m => (
              <div key={m._id} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-1.5">
                <Avatar name={m.name} color={m.avatarColor} size="sm" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{m.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{m.role}</p>
                </div>
                {isAdmin && project.createdBy?._id !== m._id && (
                  <button
                    onClick={() => handleRemoveMember(m._id)}
                    className="ml-1 text-gray-400 hover:text-red-500 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Tasks</h2>
        {isAdmin && (
          <Button size="sm" onClick={() => setShowCreateTask(true)}>
            <Plus className="w-4 h-4" /> Add Task
          </Button>
        )}
      </div>

      <KanbanBoard
        tasks={tasks}
        onUpdate={handleUpdateTask}
        onDelete={handleDeleteTask}
        onReorder={handleReorder}
        projectMembers={project.members}
        isAdmin={isAdmin}
      />

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-gray-400" /> Activity
        </h2>
        {activities.length > 0 ? (
          <div className="space-y-3">
            {activities.map((act) => (
              <div key={act._id} className="flex items-start gap-3">
                <Avatar name={act.user?.name} color={act.user?.avatarColor} size="sm" className="mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium">{act.user?.name}</span>{' '}
                    {act.action.replace(/_/g, ' ')}
                    {act.metadata?.title && <span className="text-gray-500"> — "{act.metadata.title}"</span>}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatRelativeTime(act.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-8">No activity yet</p>
        )}
      </div>

      <Modal open={showCreateTask} onClose={() => setShowCreateTask(false)} title="Create Task" size="lg">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <Input label="Title" placeholder="Task title" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} required />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
            <textarea className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500" rows={3} placeholder="Optional description" value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Priority</label>
              <select className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500" value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Assign To</label>
              <select className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500" value={taskForm.assignedTo} onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}>
                <option value="">Unassigned</option>
                {project.members?.map(m => (
                  <option key={m._id} value={m._id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Due Date" type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
            <Input label="Labels (comma separated)" placeholder="frontend, urgent" value={taskForm.labels} onChange={(e) => setTaskForm({ ...taskForm, labels: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowCreateTask(false)}>Cancel</Button>
            <Button type="submit" loading={creating}>Create Task</Button>
          </div>
        </form>
      </Modal>

      <Modal open={showAddMember} onClose={() => setShowAddMember(false)} title="Add Member" size="sm">
        <form onSubmit={handleAddMember} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">User Email</label>
            <select className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500" value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)} required>
              <option value="">Select a user...</option>
              {/* In a real app, fetch users. For now, known demo users */}
              <option value="nazia@ektaara.dev">Nazia</option>
              <option value="sravys@ektaara.dev">Sravys</option>
              <option value="anoohya@ektaara.dev">Anoohya</option>
              <option value="krishna@ektaara.dev">Krishna</option>
              <option value="anusha@ektaara.dev">Anusha</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowAddMember(false)}>Cancel</Button>
            <Button type="submit" loading={addingMember}>Add Member</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
