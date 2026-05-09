import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile } from '../services/auth';
import toast from 'react-hot-toast';
import Avatar from '../components/ui/Avatar';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { formatDate } from '../lib/dateUtils';

export default function Profile() {
  const { user, login } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ name });
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Profile</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account settings</p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
          <Avatar name={user?.name} color={user?.avatarColor} size="lg" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{user?.name}</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full text-xs font-medium capitalize">{user?.role}</span>
          </div>
        </div>

        <div className="space-y-4">
          <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Email" value={user?.email || ''} disabled className="opacity-60" />
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>Member since: {formatDate(user?.createdAt)}</p>
          </div>
          <div className="pt-2">
            <Button onClick={handleSave} loading={saving}>Save Changes</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
