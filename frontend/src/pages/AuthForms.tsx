import { useAuth } from '../hooks/useAuth';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useState } from 'react';
import styles from './AuthForms.module.css';

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
  const [isLogin, setIsLogin] = useState(true);

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
    <div className={styles.container}>
      {isLogin ? (
        <div className={styles.formWrapper}>
          <div className={styles.formCard}>
            <h2 className={styles.title}>Login</h2>
            <form className={styles.form} onSubmit={loginForm.handleSubmit(onLogin)}>
              <input className={styles.input} placeholder="Email" {...loginForm.register('email')} />
              <input className={styles.input} placeholder="Password" type="password" {...loginForm.register('password')} />
              {loginError && <div className={styles.error}>{loginError}</div>}
              <button 
                className={styles.buttonLogin}
                type="submit"
                disabled={loginLoading}
              >
                {loginLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>
            <div className={styles.helperText}>
              Haven't registered yet?{' '}
              <button
                type="button"
                className={styles.link}
                onClick={() => setIsLogin(false)}
              >
                Register
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.formWrapper}>
          <div className={styles.formCard}>
            <h2 className={styles.title}>Register</h2>
            <form className={styles.form} onSubmit={regForm.handleSubmit(onRegister)}>
              <input className={styles.input} placeholder="Name" {...regForm.register('name')} />
              <input className={styles.input} placeholder="Email" {...regForm.register('email')} />
              <input className={styles.input} placeholder="Password" type="password" {...regForm.register('password')} />
              {registerError && <div className={styles.error}>{registerError}</div>}
              <button 
                className={styles.buttonRegister}
                type="submit"
                disabled={registerLoading}
              >
                {registerLoading ? 'Registering...' : 'Register'}
              </button>
            </form>
            <div className={styles.helperText}>
              Already have an account?{' '}
              <button
                type="button"
                className={styles.link}
                onClick={() => setIsLogin(true)}
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
