import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, UserPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { BlurFade } from '../components/magicui/BlurFade';
import { ShimmerButton } from '../components/magicui/ShimmerButton';

import { authService } from '../services/authService';

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await authService.register({ name, email, password });
      navigate('/login');
    } catch (error) {
      console.error('Registration failed', error);
      alert('Failed to register. Please try again.');
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
              <UserPlus size={24} strokeWidth={2} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Create Account</h1>
            <p className="text-gray-500 mt-1.5 text-sm">Start managing your time efficiently</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <Input
              type="text"
              label="Full Name"
              placeholder="Khwaja Iqyan Ali"
              icon={<User size={20} />}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
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

            <ShimmerButton type="submit" className="w-full mt-4 flex justify-center">
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </ShimmerButton>
          </form>

          <p className="text-center text-gray-500 mt-8 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-purple-600 hover:text-purple-500 inline-flex items-center gap-1 transition-colors">
              Sign in <ArrowRight size={14} />
            </Link>
          </p>
        </div>
      </BlurFade>
    </div>
  );
};
