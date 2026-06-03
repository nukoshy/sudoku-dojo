import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Nav } from '@/components/Nav';
import { usePlayer } from '@/stores/player';
import { useAuth } from '@/stores/auth';
import { useSettings } from '@/stores/settings';
import { Onboarding } from '@/screens/Onboarding';
import { Home } from '@/screens/Home';
import { Play } from '@/screens/Play';
import { Profile } from '@/screens/Profile';
import { Leaderboard } from '@/screens/Leaderboard';
import { Techniques } from '@/screens/Techniques';
import { Paywall } from '@/screens/Paywall';

const HUB_ROUTES = ['/', '/leaderboard', '/techniques', '/profile'];

export default function App() {
  const onboarded = usePlayer((s) => s.onboarded);
  const init = useAuth((s) => s.init);
  const syncMotion = useSettings((s) => s.syncSystemMotion);
  const location = useLocation();

  useEffect(() => {
    void init();
    syncMotion();
  }, [init, syncMotion]);

  const showNav = onboarded && HUB_ROUTES.includes(location.pathname);

  return (
    <div className="dojo-scene min-h-screen">
      <div className={showNav ? 'md:pl-24' : ''}>
        <Routes>
          <Route
            path="/onboarding"
            element={onboarded ? <Navigate to="/" replace /> : <Onboarding />}
          />
          <Route path="/" element={<Guard><Home /></Guard>} />
          <Route path="/play" element={<Guard><Play /></Guard>} />
          <Route path="/profile" element={<Guard><Profile /></Guard>} />
          <Route path="/leaderboard" element={<Guard><Leaderboard /></Guard>} />
          <Route path="/techniques" element={<Guard><Techniques /></Guard>} />
          <Route path="/paywall" element={<Guard><Paywall /></Guard>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      {showNav && <Nav />}
    </div>
  );
}

function Guard({ children }: { children: React.ReactNode }) {
  const onboarded = usePlayer((s) => s.onboarded);
  if (!onboarded) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}
