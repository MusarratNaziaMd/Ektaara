import { useState, useEffect } from 'react';
import { getProjects } from '../services/auth';
import { CardSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import { Users } from 'lucide-react';

export default function Team() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProjects()
      .then(({ data }) => {
        const userMap = new Map();
        data.data.projects.forEach(p => {
          p.members?.forEach(m => {
            if (!userMap.has(m._id)) {
              userMap.set(m._id, { ...m, projects: [] });
            }
            userMap.get(m._id).projects.push(p.title);
          });
        });
        setMembers(Array.from(userMap.values()));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1,2,3].map(i => <CardSkeleton key={i} />)}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Team</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">All team members across projects</p>
      </div>

      {members.length === 0 ? (
        <EmptyState title="No team members" icon={Users} description="Team members will appear once projects are created" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => (
            <div key={member._id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex items-center gap-3 mb-3">
                <Avatar name={member.name} color={member.avatarColor} size="lg" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{member.name}</h3>
                  <Badge variant={member.role === 'admin' ? 'primary' : 'default'}>{member.role}</Badge>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Projects ({member.projects.length})</p>
                <div className="flex flex-wrap gap-1">
                  {member.projects.map((p, i) => (
                    <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded text-xs">{p}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
