import { Inbox } from 'lucide-react';
import Button from './Button';

export default function EmptyState({ icon: Icon = Inbox, title, description, action, actionLabel }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
        <Icon className="w-10 h-10 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-sm">{description}</p>}
      {action && actionLabel && (
        <Button onClick={action} variant="primary" size="sm">{actionLabel}</Button>
      )}
    </div>
  );
}
