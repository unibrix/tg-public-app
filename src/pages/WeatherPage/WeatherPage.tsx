import { Section, Cell, List } from '@telegram-apps/telegram-ui';

export function WeatherPage() {
  return (
    <List>
      <Section header="Weather">
        <Cell subtitle="Location access required">
          Weather based on your location
        </Cell>
      </Section>
    </List>
  );
}
