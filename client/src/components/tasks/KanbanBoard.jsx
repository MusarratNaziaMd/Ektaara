import { useState, useCallback, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import TaskCard from './TaskCard';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { STATUS_LABELS } from '../../lib/constants';
import toast from 'react-hot-toast';

const COLUMNS = ['todo', 'in-progress', 'done'];

const columnColors = {
  todo: 'border-t-yellow-400',
  'in-progress': 'border-t-blue-400',
  done: 'border-t-green-400',
};

export default function KanbanBoard({ tasks, onUpdate, onDelete, onReorder, projectMembers, isAdmin }) {
  const [activeTask, setActiveTask] = useState(null);
  const [editTask, setEditTask] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', priority: '', assignedTo: '', dueDate: '', labels: '', status: '' });
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const columnTasks = useMemo(() => {
    const map = { todo: [], 'in-progress': [], done: [] };
    tasks.forEach(t => {
      if (map[t.status]) map[t.status].push(t);
    });
    Object.values(map).forEach(col => col.sort((a, b) => a.order - b.order));
    return map;
  }, [tasks]);

  const handleDragStart = useCallback((event) => {
    const task = tasks.find(t => t._id === event.active.id);
    if (task) setActiveTask(task);
  }, [tasks]);

  const handleDragEnd = useCallback(async (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over || active.id === over.id) return;

    const activeTaskData = tasks.find(t => t._id === active.id);
    if (!activeTaskData) return;

    const overContainer = over.data.current?.sortable?.containerId || over.id;

    let newStatus = activeTaskData.status;
    if (COLUMNS.includes(over.id)) {
      newStatus = over.id;
    } else if (over.data.current?.type === 'task') {
      const overTask = tasks.find(t => t._id === over.id);
      if (overTask) newStatus = overTask.status;
    }

    const newTasks = tasks.map(t => t._id === active.id ? { ...t, status: newStatus } : t);
    const colTasks = newTasks.filter(t => t.status === newStatus).sort((a, b) => a.order - b.order);
    const reordered = colTasks.map((t, i) => ({ ...t, order: i }));

    const updated = newTasks.map(t => {
      const found = reordered.find(r => r._id === t._id);
      return found || t;
    });

    onReorder(updated);
  }, [tasks, onReorder]);

  const handleEdit = (task) => {
    setEditTask(task);
    setEditForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      assignedTo: task.assignedTo?._id || '',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      labels: task.labels?.join(', ') || '',
      status: task.status,
    });
  };

  const handleSave = async () => {
    if (!editTask) return;
    setSaving(true);
    try {
      const data = {
        title: editForm.title,
        description: editForm.description,
        priority: editForm.priority,
        assignedTo: editForm.assignedTo || null,
        dueDate: editForm.dueDate || null,
        labels: editForm.labels ? editForm.labels.split(',').map(l => l.trim()).filter(Boolean) : [],
        status: editForm.status,
      };
      await onUpdate(editTask._id, data);
      toast.success('Task updated');
      setEditTask(null);
    } catch (err) {
      toast.error('Failed to update task');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (task) => {
    if (!confirm(`Delete "${task.title}"?`)) return;
    try {
      await onDelete(task._id);
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
    }
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[400px]">
          {COLUMNS.map((status) => (
            <div
              key={status}
              className={`bg-gray-50 dark:bg-gray-900/50 rounded-xl border-t-4 ${columnColors[status]} border border-gray-200 dark:border-gray-700`}
            >
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                    {STATUS_LABELS[status]}
                  </h3>
                  <span className="text-xs text-gray-500 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                    {columnTasks[status]?.length || 0}
                  </span>
                </div>
              </div>

              <div className="p-3 space-y-3 min-h-[200px]">
                <SortableContext
                  items={columnTasks[status].map(t => t._id)}
                  strategy={verticalListSortingStrategy}
                >
                  {columnTasks[status]?.map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      isAdmin={isAdmin}
                    />
                  ))}
                </SortableContext>

                {(!columnTasks[status] || columnTasks[status].length === 0) && (
                  <div className="text-center py-8 text-sm text-gray-400">
                    <p>No tasks</p>
                    <p className="text-xs mt-1">Drag tasks here</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <DragOverlay>
          {activeTask && <div className="bg-white dark:bg-gray-800 rounded-lg border border-indigo-500 shadow-xl p-3 rotate-3"><TaskCard task={activeTask} onEdit={() => {}} onDelete={() => {}} isAdmin={false} /></div>}
        </DragOverlay>
      </DndContext>

      <Modal open={!!editTask} onClose={() => setEditTask(null)} title="Edit Task" size="lg">
        {editTask && (
          <div className="space-y-4">
            <Input label="Title" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} required />

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
              <textarea className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500" rows={3} value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Priority</label>
                <select className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500" value={editForm.priority} onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                <select className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500" value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                  <option value="todo">Todo</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Assign To</label>
                <select className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500" value={editForm.assignedTo} onChange={(e) => setEditForm({ ...editForm, assignedTo: e.target.value })}>
                  <option value="">Unassigned</option>
                  {projectMembers?.map(m => (
                    <option key={m._id} value={m._id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <Input label="Due Date" type="date" value={editForm.dueDate} onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })} />
            </div>

            <Input label="Labels (comma separated)" placeholder="frontend, urgent" value={editForm.labels} onChange={(e) => setEditForm({ ...editForm, labels: e.target.value })} />

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setEditTask(null)}>Cancel</Button>
              <Button onClick={handleSave} loading={saving}>Save Changes</Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
