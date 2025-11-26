import { useLocation, useNavigate } from 'react-router-dom';
import { hapticFeedback } from '@tma.js/sdk-react';
import { Tabbar } from '@telegram-apps/telegram-ui';
import { useAppStore } from '@/store';
import { WalletIcon, WeatherIcon, PhotosIcon, SettingsIcon } from '@/components/icons';

interface Tab {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const tabs: Tab[] = [
  { path: '/', label: 'Wallet', icon: <WalletIcon /> },
  { path: '/weather', label: 'Weather', icon: <WeatherIcon /> },
  { path: '/photos', label: 'Photos', icon: <PhotosIcon /> },
  { path: '/settings', label: 'Settings', icon: <SettingsIcon /> },
];

export function TabBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const hapticsEnabled = useAppStore((s) => s.hapticsEnabled);

  const handleTabClick = (path: string) => {
    if (location.pathname !== path) {
      if (hapticsEnabled && hapticFeedback.selectionChanged.isAvailable()) {
        hapticFeedback.selectionChanged();
      }
      navigate(path);
    }
  };

  return (
    <div className="tabbar-wrapper">
      <Tabbar>
        {tabs.map((tab) => (
          <Tabbar.Item
            key={tab.path}
            text={tab.label}
            selected={location.pathname === tab.path}
            onClick={() => handleTabClick(tab.path)}
          >
            {tab.icon}
          </Tabbar.Item>
        ))}
      </Tabbar>
    </div>
  );
}
