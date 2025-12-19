import { useAuth } from './hooks/useAuth';
import { AuthForms } from './pages/AuthForms';
import { Dashboard } from './pages/Dashboard';
import './App.css';

function App() {
  const { user } = useAuth();

  return user ? <Dashboard /> : <AuthForms />;
}

export default App
