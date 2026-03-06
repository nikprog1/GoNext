import * as React from 'react';
import { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Appbar, Text, Button, Dialog, Portal, RadioButton, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { getErrors, clearErrors } from '@/utils/logger';
import { useThemeContext } from '@/context/ThemeProvider';
import { PrimaryColors } from '@/constants/theme';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';
import { saveLanguage, type SupportedLanguage } from '@/utils/i18n-storage';

export default function SettingsScreen() {
  const router = useRouter();
  const [logsVisible, setLogsVisible] = useState(false);
  const [errorLogs, setErrorLogs] = useState<string[]>([]);
  const { mode, setMode, primaryColor, setPrimaryColor } = useThemeContext();
  const theme = useTheme();
  const { t } = useTranslation();
  const [language, setLanguage] = useState<SupportedLanguage>(
    (i18n.language as SupportedLanguage) || 'ru'
  );

  const showLogs = () => {
    setErrorLogs(getErrors());
    setLogsVisible(true);
  };

  const handleClearLogs = () => {
    clearErrors();
    setErrorLogs([]);
    setLogsVisible(false);
  };

  const refreshLogs = () => {
    setErrorLogs(getErrors());
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={t('settings.title')} />
      </Appbar.Header>
      <View style={styles.content}>
        <Text variant="bodyLarge">{t('settings.title')} {t('app.name')}</Text>
        <Text variant="bodyMedium" style={styles.hint}>
          {t('settings.version', { version: '1.0.0' })}
        </Text>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          {t('settings.themeSection')}
        </Text>
        <RadioButton.Group
          onValueChange={(value) => setMode(value as 'light' | 'dark')}
          value={mode}
        >
          <RadioButton.Item label={t('settings.lightTheme', { defaultValue: 'Светлая тема' })} value="light" />
          <RadioButton.Item label={t('settings.darkTheme', { defaultValue: 'Тёмная тема' })} value="dark" />
        </RadioButton.Group>

        <Text variant="titleMedium" style={styles.sectionTitle}>
          {t('settings.primaryColorSection')}
        </Text>
        <View style={styles.palette}>
          {PrimaryColors.map((c) => {
            const selected = c.key === primaryColor;
            return (
              <TouchableOpacity
                key={c.key}
                style={[
                  styles.colorDot,
                  { backgroundColor: c.value },
                  selected && {
                    borderWidth: 3,
                    borderColor: theme.colors.onPrimary,
                  },
                ]}
                onPress={() => setPrimaryColor(c.key)}
              />
            );
          })}
        </View>

        <Text variant="titleMedium" style={styles.sectionTitle}>
          {t('settings.languageSection')}
        </Text>
        <RadioButton.Group
          onValueChange={async (value) => {
            const lang = value as SupportedLanguage;
            setLanguage(lang);
            await i18n.changeLanguage(lang);
            await saveLanguage(lang);
          }}
          value={language}
        >
          <RadioButton.Item label={t('language.ru')} value="ru" />
          <RadioButton.Item label={t('language.en')} value="en" />
        </RadioButton.Group>

        <Button
          mode="outlined"
          style={styles.logsButton}
          onPress={showLogs}
          icon="bug"
        >
          {t('settings.logsButton')}
        </Button>
      </View>

      <Portal>
        <Dialog visible={logsVisible} onDismiss={() => setLogsVisible(false)}>
          <Dialog.Title>{t('settings.logsTitle')}</Dialog.Title>
          <Dialog.ScrollArea style={styles.dialogScroll}>
            <ScrollView style={styles.scrollContent}>
              {errorLogs.length === 0 ? (
                <Text variant="bodyMedium" style={styles.emptyLogs}>
                  {t('settings.logsEmpty')}
                </Text>
              ) : (
                errorLogs.map((log, i) => (
                  <Text key={i} variant="bodySmall" style={styles.logEntry}>
                    {log}
                  </Text>
                ))
              )}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={refreshLogs}>{t('settings.logsRefresh')}</Button>
            <Button onPress={handleClearLogs}>{t('settings.logsClear')}</Button>
            <Button onPress={() => setLogsVisible(false)}>{t('settings.logsClose')}</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 24 },
  hint: { marginTop: 16, color: '#666' },
  sectionTitle: { marginTop: 24, marginBottom: 8 },
  palette: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  logsButton: { marginTop: 24 },
  dialogScroll: { maxHeight: 400 },
  scrollContent: { padding: 16 },
  emptyLogs: { color: '#666' },
  logEntry: { marginBottom: 12, fontFamily: 'monospace' },
});
