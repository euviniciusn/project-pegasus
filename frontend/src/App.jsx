import { lazy, Suspense } from 'react';
import { JobProvider } from './contexts/JobContext.jsx';
import { ToastProvider } from './contexts/ToastContext.jsx';
import ConverterPage from './pages/ConverterPage.jsx';

const AdminPage = lazy(() => import('./pages/AdminPage.jsx'));
const isAdmin = window.location.pathname === '/admin';

function App() {
  if (isAdmin) {
    return (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-neutral-400">Carregando...</div>}>
        <AdminPage />
      </Suspense>
    );
  }

  return (
    <ToastProvider>
      <JobProvider>
        <ConverterPage />
      </JobProvider>
    </ToastProvider>
  );
}

export default App;
