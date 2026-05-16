import { useState, type FormEvent } from 'react';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { useAuthStore } from '../store/useAuthStore';
import { BlurFade } from '../components/magicui/BlurFade';
import { ShimmerButton } from '../components/magicui/ShimmerButton';

import { authService } from '../services/authService';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { token, user } = await authService.login(email, password);
      login(token, user);
      navigate('/');
    } catch (error) {
      console.error('Login failed', error);
      alert('Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F4F6F8]">
      <BlurFade delay={0.1} inView className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 text-purple-600 shadow-inner">
              <LogIn size={24} strokeWidth={2} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Welcome Back</h1>
            <p className="text-gray-500 mt-1.5 text-sm">Sign in to track your day</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <Input
              type="email"
              label="Email Address"
              placeholder="you@example.com"
              icon={<Mail size={20} />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              label="Password"
              placeholder="••••••••"
              icon={<Lock size={20} />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            
            <div className="flex justify-end">
              <a href="#" className="text-sm font-medium text-purple-600 hover:text-purple-500">
                Forgot password?
              </a>
            </div>

            <ShimmerButton type="submit" className="w-full mt-2 flex justify-center">
              {isLoading ? 'Signing In...' : 'Sign In'}
            </ShimmerButton>
          </form>

          <p className="text-center text-gray-500 mt-8 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-purple-600 hover:text-purple-500 inline-flex items-center gap-1 transition-colors">
              Create one <ArrowRight size={14} />
            </Link>
          </p>
        </div>
      </BlurFade>
    </div>
  );
};
