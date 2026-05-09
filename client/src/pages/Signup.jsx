import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { signup, user } = useAuth();
  const navigate = useNavigate();

  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await signup(form);
      const role = res.data.user.role;
      toast.success(role === 'admin' ? 'Welcome! You are the first admin.' : 'Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050810] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-[#A1FFC2] rounded-xl flex items-center justify-center">
              <span className="text-[#050810] font-bold text-lg">E</span>
            </div>
            <span className="text-2xl font-bold text-white">Ektaara</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-white/50 mt-1">Start collaborating with your team</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#1A1A2E] rounded-xl border border-white/10 p-6 space-y-4 shadow-sm">
          <Input
            label="Full Name"
            type="text"
            placeholder="Your name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="At least 6 characters"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            minLength={6}
          />
          <p className="text-xs text-white/30 text-center">
            First user to sign up becomes the team admin.
          </p>
          <Button type="submit" loading={loading} className="w-full">
            Create Account
          </Button>
        </form>

        <p className="text-center mt-6 text-sm text-white/50">
          Already have an account?{' '}
          <Link to="/login" className="text-[#A1FFC2] hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
