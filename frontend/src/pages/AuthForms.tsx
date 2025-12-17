import { useAuth } from '../hooks/useAuth';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
const registerSchema = z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(6) });

export function AuthForms() {
  const { login, register: registerUser } = useAuth();
  const loginForm = useForm<{ email: string; password: string }>();
  const regForm = useForm<{ name: string; email: string; password: string }>();

  const onLogin = async (values: { email: string; password: string }) => {
    const parsed = loginSchema.safeParse(values);
    if (!parsed.success) return alert('Invalid login');
    await login(values);
  };

  const onRegister = async (values: { name: string; email: string; password: string }) => {
    const parsed = registerSchema.safeParse(values);
    if (!parsed.success) return alert('Invalid register');
    await registerUser(values);
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
      <div className="border rounded p-6">
        <h2 className="text-xl font-semibold mb-4">Login</h2>
        <form className="space-y-4" onSubmit={loginForm.handleSubmit(onLogin)}>
          <input className="w-full border p-2" placeholder="Email" {...loginForm.register('email')} />
          <input className="w-full border p-2" placeholder="Password" type="password" {...loginForm.register('password')} />
          <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">Login</button>
        </form>
      </div>
      <div className="border rounded p-6">
        <h2 className="text-xl font-semibold mb-4">Register</h2>
        <form className="space-y-4" onSubmit={regForm.handleSubmit(onRegister)}>
          <input className="w-full border p-2" placeholder="Name" {...regForm.register('name')} />
          <input className="w-full border p-2" placeholder="Email" {...regForm.register('email')} />
          <input className="w-full border p-2" placeholder="Password" type="password" {...regForm.register('password')} />
          <button className="bg-green-600 text-white px-4 py-2 rounded" type="submit">Register</button>
        </form>
      </div>
    </div>
  );
}
