import { Link } from 'react-router-dom';
import { ArrowRight, KanbanSquare, CalendarCheck, Users } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#050810]">
      <header className="border-b border-white/10 bg-[#0D0D1A]/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#A1FFC2] rounded-lg flex items-center justify-center">
              <span className="text-[#050810] font-bold text-sm">E</span>
            </div>
            <span className="font-semibold text-white">Ethara</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white transition-colors">
              Login
            </Link>
            <Link to="/signup" className="px-4 py-2 text-sm font-medium bg-[#A1FFC2] text-[#050810] rounded-lg hover:brightness-110 transition-all shadow-sm font-semibold">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-16">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Track Projects.{' '}
              <span className="text-[#A1FFC2]">Align Teams.</span>
              <br />
              Deliver Faster.
            </h1>
            <p className="mt-6 text-lg text-white/50 max-w-2xl mx-auto">
              Ethara is a smart collaborative platform for teams to create projects, assign tasks, track deadlines, and monitor progress in real-time.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#A1FFC2] text-[#050810] font-semibold rounded-lg hover:brightness-110 transition-all shadow-sm glow-mint"
              >
                Start Free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#2E2A4A] text-white font-medium rounded-lg border border-white/10 hover:bg-[#3A3555] transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: KanbanSquare,
                title: 'Kanban Workflow',
                description: 'Visual task management with drag-and-drop boards. Move tasks across Todo, In Progress, and Done.'
              },
              {
                icon: CalendarCheck,
                title: 'Smart Scheduling',
                description: 'Deadline tracking, priority scheduling, and overdue highlighting to keep your team on track.'
              },
              {
                icon: Users,
                title: 'Team Collaboration',
                description: 'Role-based access, real-time updates, and activity feeds that make teamwork seamless.'
              }
            ].map(({ icon: Icon, title, description }) => (
              <div key={title} className="bg-[#1A1A2E] rounded-xl border border-white/10 p-6 hover:border-[#A1FFC2]/30 transition-all hover:shadow-lg hover:shadow-[#A1FFC2]/5">
                <div className="p-3 bg-[#A1FFC2]/10 rounded-lg w-fit mb-4">
                  <Icon className="w-6 h-6 text-[#A1FFC2]" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-6">
        <p className="text-center text-sm text-white/30">
          &copy; {new Date().getFullYear()} Ethara. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
