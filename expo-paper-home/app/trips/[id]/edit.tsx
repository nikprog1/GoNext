import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import {
  Appbar,
  TextInput,
  Button,
  Text,
  Switch,
  Snackbar,
  ActivityIndicator,
} from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getTripById, updateTrip } from '@/services';
import { logError } from '@/utils/logger';
import type { Trip } from '@/types';

export default function EditTripScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState('');

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const t = await getTripById(id);
      setTrip(t);
    } catch (e) {
      logError('trips/edit: загрузка поездки', e);
      setSnackbar('Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    if (!trip || !id) return;
    if (!trip.title.trim()) {
      setSnackbar('Укажите название');
      return;
    }
    setSaving(true);
    try {
      await updateTrip(trip);
      router.back();
    } catch (e) {
      logError('trips/edit: сохранение поездки', e);
      setSnackbar('Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  if (!id || loading || !trip) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Редактирование" />
        </Appbar.Header>
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Редактирование поездки" />
      </Appbar.Header>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        <TextInput
          label="Название *"
          value={trip.title}
          onChangeText={(t) => setTrip((p) => (p ? { ...p, title: t } : p))}
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Описание"
          value={trip.description}
          onChangeText={(t) => setTrip((p) => (p ? { ...p, description: t } : p))}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={styles.input}
        />
        <TextInput
          label="Дата начала"
          value={trip.startDate}
          onChangeText={(t) => setTrip((p) => (p ? { ...p, startDate: t } : p))}
          mode="outlined"
          placeholder="YYYY-MM-DD"
          style={styles.input}
        />
        <TextInput
          label="Дата окончания"
          value={trip.endDate}
          onChangeText={(t) => setTrip((p) => (p ? { ...p, endDate: t } : p))}
          mode="outlined"
          placeholder="YYYY-MM-DD"
          style={styles.input}
        />
        <View style={styles.row}>
          <Text variant="bodyLarge">Текущая поездка</Text>
          <Switch
            value={trip.current}
            onValueChange={(v) => setTrip((p) => (p ? { ...p, current: v } : p))}
          />
        </View>
        <Button
          mode="contained"
          onPress={handleSave}
          loading={saving}
          disabled={saving}
          style={styles.save}
        >
          Сохранить
        </Button>
      </ScrollView>

      <Snackbar visible={!!snackbar} onDismiss={() => setSnackbar('')} duration={2000}>
        {snackbar}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  contentInner: { padding: 16, paddingBottom: 32 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  input: { marginBottom: 12 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  save: { marginTop: 24 },
});
