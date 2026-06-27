import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { Eye, EyeOff, LayoutDashboard, CheckSquare, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function Register() {
  const { register: registerField, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(registerSchema)
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setErrorMsg('');
    const res = await register(data.name, data.email, data.password);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-8"
        >
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Create an account</h1>
            <p className="text-muted-foreground mt-2 text-lg">Join DevFlow to streamline your projects.</p>
          </div>
          
          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm text-center font-medium"
            >
              {errorMsg}
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-foreground/80">Full Name</label>
              <input
                type="text"
                {...registerField('name')}
                className={`w-full px-4 py-3 bg-card border ${errors.name ? 'border-destructive' : 'border-border'} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow`}
                placeholder="John Doe"
              />
              {errors.name && <p className="text-destructive text-sm mt-1.5 font-medium">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5 text-foreground/80">Email</label>
              <input
                type="email"
                {...registerField('email')}
                className={`w-full px-4 py-3 bg-card border ${errors.email ? 'border-destructive' : 'border-border'} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow`}
                placeholder="you@example.com"
              />
              {errors.email && <p className="text-destructive text-sm mt-1.5 font-medium">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5 text-foreground/80">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...registerField('password')}
                  className={`w-full px-4 py-3 bg-card border ${errors.password ? 'border-destructive' : 'border-border'} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow pr-12`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-destructive text-sm mt-1.5 font-medium">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {isSubmitting ? 'Creating account...' : 'Sign up for DevFlow'}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground font-medium">
            Already have an account? <Link to="/login" className="text-primary hover:underline">Log in</Link>
          </p>
        </motion.div>
      </div>

      {/* Right side: Features / Graphic */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary/20 via-background to-secondary items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/30 rounded-full mix-blend-screen filter blur-[100px] animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-500/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000"></div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-md space-y-8 z-10"
        >
          <div className="space-y-2">
            <h2 className="text-3xl font-bold">More than just a Kanban.</h2>
            <p className="text-lg text-muted-foreground">DevFlow helps your team ship faster with powerful tools designed for modern software development.</p>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4 items-start">
              <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Intelligent Dashboard</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Get a bird's eye view of your team's performance, overdue tasks, and upcoming sprint deadlines all in one place.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="p-3 bg-orange-500/10 text-orange-500 rounded-xl">
                <CheckSquare className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Real-time Kanban</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Drag and drop tasks effortlessly. Status updates instantly reflect for everyone in your workspace.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Lightning Fast</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Built with a modern tech stack to ensure your workflow is never interrupted by slow loading times.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
