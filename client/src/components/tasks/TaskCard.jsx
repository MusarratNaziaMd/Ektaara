import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Calendar, User } from 'lucide-react';
import { PRIORITY_COLORS } from '../../lib/constants';
import { isOverdue, formatDate } from '../../lib/dateUtils';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';

export default function TaskCard({ task, onEdit, onDelete, isAdmin }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task._id,
    data: { type: 'task', task }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const priority = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium;
  const overdue = task.dueDate && isOverdue(task.dueDate) && task.status !== 'done';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
      onClick={() => onEdit(task)}
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 cursor-grab active:cursor-grabbing touch-none"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4" />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <div className={`w-2 h-2 rounded-full ${priority.dot}`} />
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{task.title}</h4>
          </div>

          {task.labels?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {task.labels.map((label, i) => (
                <Badge key={i} variant="primary">{label}</Badge>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-3">
              {task.dueDate && (
                <span className={`flex items-center gap-1 ${overdue ? 'text-red-500 font-medium' : ''}`}>
                  <Calendar className="w-3 h-3" />
                  {formatDate(task.dueDate)}
                </span>
              )}
              {overdue && <span className="text-red-500 font-medium">Overdue</span>}
            </div>

            {task.assignedTo && (
              <div onClick={(e) => e.stopPropagation()}>
                <Avatar name={task.assignedTo.name} color={task.assignedTo.avatarColor} size="sm" />
              </div>
            )}
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(task); }}
            className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
