import * as React from 'react';
import { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Appbar, Text, Button, Dialog, Portal } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { getErrors, clearErrors } from '@/utils/logger';

export default function SettingsScreen() {
  const router = useRouter();
  const [logsVisible, setLogsVisible] = useState(false);
  const [errorLogs, setErrorLogs] = useState<string[]>([]);

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
  logsButton: { marginTop: 24 },
  dialogScroll: { maxHeight: 400 },
  scrollContent: { padding: 16 },
  emptyLogs: { color: '#666' },
  logEntry: { marginBottom: 12, fontFamily: 'monospace' },
});
