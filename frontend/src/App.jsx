import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { JobProvider } from './contexts/JobContext.jsx';
import { ToastProvider } from './contexts/ToastContext.jsx';
import Layout from './components/Layout.jsx';
import ConvertPage from './pages/ConvertPage.jsx';
import CompressPage from './pages/CompressPage.jsx';
import ResizePage from './pages/ResizePage.jsx';

const AdminPage = lazy(() => import('./pages/AdminPage.jsx'));

function AdminFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center text-neutral-400">
      Carregando...
    </div>
  );
}

function AppRoutes() {
  const { pathname } = useLocation();

  if (pathname === '/admin') {
    return (
      <Suspense fallback={<AdminFallback />}>
        <AdminPage />
      </Suspense>
    );
  }

  return (
    <Layout>
      <JobProvider key={pathname}>
        <Routes>
          <Route path="/" element={<ConvertPage />} />
          <Route path="/compress" element={<CompressPage />} />
          <Route path="/resize" element={<ResizePage />} />
        </Routes>
      </JobProvider>
    </Layout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </BrowserRouter>
  );
}
