export const PRIORITY_COLORS = {
  urgent: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500' },
  high: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', dot: 'bg-orange-500' },
  medium: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500' },
  low: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400', dot: 'bg-gray-400' }
};

export const STATUS_LABELS = {
  'todo': 'Todo',
  'in-progress': 'In Progress',
  'done': 'Done'
};

export const PROJECT_STATUS = {
  planning: { label: 'Planning', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  active: { label: 'Active', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  completed: { label: 'Completed', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  archived: { label: 'Archived', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' }
};

export const API_URL = import.meta.env.VITE_API_URL || '';
