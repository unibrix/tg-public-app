import { useLocation, useNavigate } from 'react-router-dom';
import { hapticFeedback } from '@tma.js/sdk-react';
import { useAppStore } from '@/store';
import './TabBar.css';

interface Tab {
  path: string;
  label: string;
  icon: string;
}

const tabs: Tab[] = [
  { path: '/', label: 'Wallet', icon: '🔐' },
  { path: '/weather', label: 'Weather', icon: '🌤' },
  { path: '/photos', label: 'Photos', icon: '📷' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
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
    <nav className="tab-bar">
      {tabs.map((tab) => (
        <button
          key={tab.path}
          className={`tab-bar__item ${location.pathname === tab.path ? 'tab-bar__item--active' : ''}`}
          onClick={() => handleTabClick(tab.path)}
        >
          <span className="tab-bar__icon">{tab.icon}</span>
          <span className="tab-bar__label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
