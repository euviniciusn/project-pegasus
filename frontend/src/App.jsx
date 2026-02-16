import { JobProvider } from './contexts/JobContext.jsx';
import { ToastProvider } from './contexts/ToastContext.jsx';
import ConverterPage from './pages/ConverterPage.jsx';

function App() {
  return (
    <ToastProvider>
      <JobProvider>
        <ConverterPage />
      </JobProvider>
    </ToastProvider>
  );
}

export default App;
