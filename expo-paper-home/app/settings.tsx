import * as React from 'react';
import { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Appbar, Text, Button, Dialog, Portal, RadioButton, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { getErrors, clearErrors } from '@/utils/logger';
import { useThemeContext } from '@/context/ThemeProvider';
import { PrimaryColors } from '@/constants/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const [logsVisible, setLogsVisible] = useState(false);
  const [errorLogs, setErrorLogs] = useState<string[]>([]);
  const { mode, setMode, primaryColor, setPrimaryColor } = useThemeContext();
  const theme = useTheme();

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
        <Appbar.Content title="Настройки" />
      </Appbar.Header>
      <View style={styles.content}>
        <Text variant="bodyLarge">Настройки приложения GoNext</Text>
        <Text variant="bodyMedium" style={styles.hint}>
          Версия 1.0.0
        </Text>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Тема
        </Text>
        <RadioButton.Group
          onValueChange={(value) => setMode(value as 'light' | 'dark')}
          value={mode}
        >
          <RadioButton.Item label="Светлая тема" value="light" />
          <RadioButton.Item label="Тёмная тема" value="dark" />
        </RadioButton.Group>

        <Text variant="titleMedium" style={styles.sectionTitle}>
          Основной цвет
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

        <Button
          mode="outlined"
          style={styles.logsButton}
          onPress={showLogs}
          icon="bug"
        >
          Логи ошибок
        </Button>
      </View>

      <Portal>
        <Dialog visible={logsVisible} onDismiss={() => setLogsVisible(false)}>
          <Dialog.Title>Логи ошибок</Dialog.Title>
          <Dialog.ScrollArea style={styles.dialogScroll}>
            <ScrollView style={styles.scrollContent}>
              {errorLogs.length === 0 ? (
                <Text variant="bodyMedium" style={styles.emptyLogs}>
                  Нет записей
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
            <Button onPress={refreshLogs}>Обновить</Button>
            <Button onPress={handleClearLogs}>Очистить</Button>
            <Button onPress={() => setLogsVisible(false)}>Закрыть</Button>
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
