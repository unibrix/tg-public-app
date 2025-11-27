import { Section, Cell, List, Switch } from '@telegram-apps/telegram-ui';
import { useBiometricAuth } from '../../hooks/useBiometricAuth';
import { useAppStore } from '../../store';

export function SettingsPage() {
  const { openSettings, canOpenSettings, getState, isAvailable } = useBiometricAuth();
  const { hapticsEnabled, setHapticsEnabled } = useAppStore();
  const biometryState = getState();

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
      </Section>

      <Section header="Security">
        <Cell
          subtitle={
            !isAvailable()
              ? "Not available on this device"
              : biometryState?.accessGranted
              ? "Enabled"
              : "Tap to configure"
          }
          onClick={canOpenSettings ? openSettings : undefined}
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
