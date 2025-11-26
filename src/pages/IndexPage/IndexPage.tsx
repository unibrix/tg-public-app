import { Section, Cell, List, Avatar } from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { initData, hapticFeedback } from '@tma.js/sdk-react';

import { Page } from '@/components/Page.tsx';

export const IndexPage: FC = () => {
  const user = initData.user();

  const handleTap = () => {
    if (hapticFeedback.impactOccurred.isAvailable()) {
      hapticFeedback.impactOccurred('light');
    }
  };

  return (
    <Page back={false}>
      <List>
        <Section header="Welcome">
          <Cell
            before={
              <Avatar
                size={48}
                src={user?.photo_url}
                acronym={user?.first_name?.charAt(0) || '?'}
              />
            }
            subtitle={user?.username ? `@${user.username}` : 'Telegram User'}
            onClick={handleTap}
          >
            {user?.first_name || 'Guest'} {user?.last_name || ''}
          </Cell>
        </Section>

        <Section header="Getting Started" footer="Edit src/pages/IndexPage to customize">
          <Cell subtitle="Add your app features here">
            Your Mini App
          </Cell>
        </Section>
      </List>
    </Page>
  );
};
