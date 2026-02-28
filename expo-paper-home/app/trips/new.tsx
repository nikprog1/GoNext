import * as React from 'react';
import { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import {
  Appbar,
  TextInput,
  Button,
  Text,
  Switch,
  Snackbar,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { createTrip } from '@/services';

const today = new Date().toISOString().slice(0, 10);
const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  .toISOString()
  .slice(0, 10);

export default function NewTripScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(nextWeek);
  const [current, setCurrent] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState('');

  const handleSave = async () => {
    if (!title.trim()) {
      setSnackbar('Укажите название поездки');
      return;
    }
    setSaving(true);
    try {
      const trip = await createTrip({
        title: title.trim(),
        description: description.trim(),
        startDate,
        endDate,
        current,
      });
      router.replace(`/trips/${trip.id}` as any);
    } catch (e) {
      setSnackbar('Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Новая поездка" />
      </Appbar.Header>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        <TextInput
          label="Название *"
          value={title}
          onChangeText={setTitle}
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Описание"
          value={description}
          onChangeText={setDescription}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={styles.input}
        />
        <TextInput
          label="Дата начала"
          value={startDate}
          onChangeText={setStartDate}
          mode="outlined"
          placeholder="YYYY-MM-DD"
          style={styles.input}
        />
        <TextInput
          label="Дата окончания"
          value={endDate}
          onChangeText={setEndDate}
          mode="outlined"
          placeholder="YYYY-MM-DD"
          style={styles.input}
        />
        <View style={styles.row}>
          <Text variant="bodyLarge">Текущая поездка</Text>
          <Switch value={current} onValueChange={setCurrent} />
        </View>
        <Button
          mode="contained"
          onPress={handleSave}
          loading={saving}
          disabled={saving}
          style={styles.save}
        >
          Создать
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
  input: { marginBottom: 12 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  save: { marginTop: 24 },
});
