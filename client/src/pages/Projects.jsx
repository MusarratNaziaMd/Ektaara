import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MoreHorizontal, Calendar, Users } from 'lucide-react';
import { getProjects, createProject, deleteProject } from '../services/auth';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { CardSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import { formatDate } from '../lib/dateUtils';
import { PROJECT_STATUS } from '../lib/constants';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ title: '', description: '', deadline: '' });
  const [creating, setCreating] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchProjects = () => {
    setLoading(true);
    getProjects()
      .then(({ data }) => setProjects(data.data.projects))
      .catch(() => toast.error('Failed to load projects'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await createProject(createForm);
      toast.success('Project created');
      setShowCreate(false);
      setCreateForm({ title: '', description: '', deadline: '' });
      fetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this project? All tasks will be lost.')) return;
    try {
      await deleteProject(id);
      toast.success('Project deleted');
      fetchProjects();
    } catch {
      toast.error('Failed to delete project');
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Projects</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your team projects</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4" /> New Project
          </Button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description={isAdmin ? 'Create your first project to get started' : 'You haven\'t been added to any projects yet'}
          icon={Users}
          action={isAdmin ? () => setShowCreate(true) : undefined}
          actionLabel={isAdmin ? 'Create Project' : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div
              key={project._id}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => navigate(`/projects/${project._id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{project.title}</h3>
                  {project.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{project.description}</p>
                  )}
                </div>
                {isAdmin && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(project._id); }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PROJECT_STATUS[project.status]?.color || ''}`}>
                  {PROJECT_STATUS[project.status]?.label || project.status}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>{project.deadline ? formatDate(project.deadline) : 'No deadline'}</span>
                </div>
                <div className="flex -space-x-2">
                  {project.members?.slice(0, 4).map((m) => (
                    <Avatar key={m._id} name={m.name} color={m.avatarColor} size="sm" className="ring-2 ring-white dark:ring-gray-900" />
                  ))}
                  {(project.members?.length || 0) > 4 && (
                    <span className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 text-xs flex items-center justify-center text-gray-500 ring-2 ring-white dark:ring-gray-900">
                      +{project.members.length - 4}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Project">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Title" placeholder="Project name" value={createForm.title} onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })} required />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
            <textarea
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={3}
              placeholder="Brief description"
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
            />
          </div>
          <Input label="Deadline" type="date" value={createForm.deadline} onChange={(e) => setCreateForm({ ...createForm, deadline: e.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit" loading={creating}>Create</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
