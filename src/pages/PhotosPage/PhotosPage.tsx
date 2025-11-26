import { Section, Cell, List } from '@telegram-apps/telegram-ui';

export function PhotosPage() {
  return (
    <List>
      <Section header="Photos">
        <Cell subtitle="Camera and QR scanner">
          Scan QR codes and take photos
        </Cell>
      </Section>
    </List>
  );
}
