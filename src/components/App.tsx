import { useEffect, useRef } from 'react';
import { Navigate, Route, Routes, HashRouter, useNavigate } from 'react-router-dom';
import { useLaunchParams, useSignal, miniApp } from '@tma.js/sdk-react';
import { AppRoot } from '@telegram-apps/telegram-ui';

import { routes } from '@/navigation/routes.tsx';
import { TabBar } from '@/components/TabBar';
import { useStartParam } from '@/hooks';
import { useAppStore } from '@/store';

function AppRoutes() {
  const navigate = useNavigate();
  const { raw: startParam } = useStartParam();
  const setStartParam = useAppStore((s) => s.setStartParam);
  const hasProcessedDeepLink = useRef(false);

  useEffect(() => {
    if (hasProcessedDeepLink.current || !startParam) return;
    hasProcessedDeepLink.current = true;

    setStartParam(startParam);
    navigate('/settings', { replace: true });
  }, [startParam, setStartParam, navigate]);

  return (
    <>
      <Routes>
        {routes.map((route) => <Route key={route.path} {...route} />)}
        <Route path="*" element={<Navigate to="/"/>}/>
      </Routes>
      <TabBar />
    </>
  );
}

export function App() {
  const lp = useLaunchParams();
  const isDark = useSignal(miniApp.isDark);

  return (
    <AppRoot
      appearance={isDark ? 'dark' : 'light'}
      platform={['macos', 'ios'].includes(lp.tgWebAppPlatform) ? 'ios' : 'base'}
    >
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AppRoot>
  );
}
