import { Section, Cell, List } from '@telegram-apps/telegram-ui';

export function WalletPage() {
  return (
    <List>
      <Section header="Wallet">
        <Cell subtitle="Biometric authentication required">
          Protected crypto prices
        </Cell>
      </Section>
    </List>
  );
}
