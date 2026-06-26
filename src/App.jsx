import { JodoProvider, useJodo } from './context/JodoContext';
import CitizenApp, { AuthScreen } from './components/citizen/CitizenApp';
import OnboardingScreen from './components/citizen/OnboardingScreen';
import OperationsDashboard from './components/ops/OperationsDashboard';
import { Check } from 'lucide-react';

function AppShell() {
  const { isAuthenticated, appView, onboardingComplete } = useJodo();

  if (!isAuthenticated) return <AuthScreen />;
  if (appView === 'ops') return <OperationsDashboard />;
  if (!onboardingComplete) return <OnboardingScreen />;
  return <CitizenApp />;
}

export default function App() {
  return (
    <JodoProvider>
      <AppWithToast />
    </JodoProvider>
  );
}

function AppWithToast() {
  const { successToast } = useJodo();
  return (
    <>
      {successToast && (
        <div className="success-toast"><Check size={14} />{successToast}</div>
      )}
      <AppShell />
    </>
  );
}
