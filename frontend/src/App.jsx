import { JobProvider } from './contexts/JobContext.jsx';
import ConverterPage from './pages/ConverterPage.jsx';

function App() {
  return (
    <JobProvider>
      <ConverterPage />
    </JobProvider>
  );
}

export default App;
