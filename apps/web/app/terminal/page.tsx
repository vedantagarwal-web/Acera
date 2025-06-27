import TerminalLayout from '../../components/terminal/TerminalLayout';
import TerminalDashboard from '../../components/terminal/TerminalDashboard';

export const metadata = { title: 'Terminal' };

export default function TerminalPage() {
  return (
    <TerminalLayout>
      {/* Lightweight dashboard with news widget */}
      <TerminalDashboard />
    </TerminalLayout>
  );
} 