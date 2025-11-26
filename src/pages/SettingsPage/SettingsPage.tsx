import { Section, Cell, List } from '@telegram-apps/telegram-ui';

export function SettingsPage() {
  return (
    <List>
      <Section header="Settings">
        <Cell subtitle="Cloud storage sync">
          App preferences and user profile
        </Cell>
      </Section>
    </List>
  );
}
