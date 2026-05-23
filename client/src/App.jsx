import { AuthProvider } from './hooks/useAuth.jsx';
import Router from './routes/index.jsx';

export default function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}
