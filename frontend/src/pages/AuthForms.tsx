import { useAuth } from '../hooks/useAuth';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useState } from 'react';

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
const registerSchema = z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(6) });

export function AuthForms() {
  const { login, register: registerUser } = useAuth();
  const loginForm = useForm<{ email: string; password: string }>();
  const regForm = useForm<{ name: string; email: string; password: string }>();
  const [loginError, setLoginError] = useState<string>('');
  const [registerError, setRegisterError] = useState<string>('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);

  const onLogin = async (values: { email: string; password: string }) => {
    setLoginError('');
    const parsed = loginSchema.safeParse(values);
    if (!parsed.success) {
      setLoginError('Invalid email or password format');
      return;
    }
    try {
      setLoginLoading(true);
      await login(values);
    } catch (error: any) {
      setLoginError(error?.response?.data?.message || 'Login failed');
    } finally {
      setLoginLoading(false);
    }
  };

  const onRegister = async (values: { name: string; email: string; password: string }) => {
    setRegisterError('');
    const parsed = registerSchema.safeParse(values);
    if (!parsed.success) {
      setRegisterError('Name must be 2+ chars, password 6+ chars');
      return;
    }
    try {
      setRegisterLoading(true);
      await registerUser(values);
    } catch (error: any) {
      setRegisterError(error?.response?.data?.message || 'Registration failed');
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
      <div className="border rounded p-6">
        <h2 className="text-xl font-semibold mb-4">Login</h2>
        <form className="space-y-4" onSubmit={loginForm.handleSubmit(onLogin)}>
          <input className="w-full border p-2 rounded" placeholder="Email" {...loginForm.register('email')} />
          <input className="w-full border p-2 rounded" placeholder="Password" type="password" {...loginForm.register('password')} />
          {loginError && <div className="text-red-600 text-sm">{loginError}</div>}
          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded w-full disabled:opacity-50" 
            type="submit"
            disabled={loginLoading}
          >
            {loginLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
      <div className="border rounded p-6">
        <h2 className="text-xl font-semibold mb-4">Register</h2>
        <form className="space-y-4" onSubmit={regForm.handleSubmit(onRegister)}>
          <input className="w-full border p-2 rounded" placeholder="Name" {...regForm.register('name')} />
          <input className="w-full border p-2 rounded" placeholder="Email" {...regForm.register('email')} />
          <input className="w-full border p-2 rounded" placeholder="Password" type="password" {...regForm.register('password')} />
          {registerError && <div className="text-red-600 text-sm">{registerError}</div>}
          <button 
            className="bg-green-600 text-white px-4 py-2 rounded w-full disabled:opacity-50" 
            type="submit"
            disabled={registerLoading}
          >
            {registerLoading ? 'Registering...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
}
