import { Section, Cell, List, Switch, Divider } from '@telegram-apps/telegram-ui';
import { useAppStore } from '../../store';

export function SettingsPage() {
  const { hapticsEnabled, setHapticsEnabled, biometryEnabled, setBiometryEnabled } = useAppStore();

  return (
    <List>
      <Section header="Preferences">
        <Cell
          after={
            <Switch
              checked={hapticsEnabled}
              onChange={() => setHapticsEnabled(!hapticsEnabled)}
            />
          }
        >
          Haptic Feedback
        </Cell>
        <Divider />
        <Cell
          subtitle="Protect favorites and purchases"
          after={
            <Switch
              checked={biometryEnabled}
              onChange={() => setBiometryEnabled(!biometryEnabled)}
            />
          }
        >
          Biometric Authentication
        </Cell>
      </Section>

      <Section header="Data">
        <Cell subtitle="Cloud storage sync">
          App preferences synced to Telegram
        </Cell>
      </Section>
    </List>
  );
}
