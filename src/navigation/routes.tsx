import type { ComponentType } from 'react';

import { WalletPage } from '@/pages/WalletPage/WalletPage';
import { WeatherPage } from '@/pages/WeatherPage/WeatherPage';
import { PhotosPage } from '@/pages/PhotosPage/PhotosPage';
import { SettingsPage } from '@/pages/SettingsPage/SettingsPage';

interface Route {
  path: string;
  Component: ComponentType;
  title?: string;
}

export const routes: Route[] = [
  { path: '/', Component: WalletPage, title: 'Wallet' },
  { path: '/weather', Component: WeatherPage, title: 'Weather' },
  { path: '/photos', Component: PhotosPage, title: 'Photos' },
  { path: '/settings', Component: SettingsPage, title: 'Settings' },
];
