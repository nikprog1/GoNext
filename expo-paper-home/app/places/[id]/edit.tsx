import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, Image, TouchableOpacity } from 'react-native';
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
import * as ImagePicker from 'expo-image-picker';
import { getPlaceById, updatePlace } from '@/services';
import { savePhoto } from '@/services/photos';
import type { Place } from '@/types';

export default function EditPlaceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState('');

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const p = await getPlaceById(id);
      setPlace(p);
    } catch (e) {
      setSnackbar('Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const pickImage = async () => {
    if (!place) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      try {
        const path = await savePhoto(result.assets[0].uri);
        setPlace((p) => (p ? { ...p, photos: [...p.photos, path] } : p));
      } catch (e) {
        setSnackbar('Ошибка при добавлении фото');
      }
    }
  };

  const removePhoto = (index: number) => {
    if (place) setPlace({ ...place, photos: place.photos.filter((_, i) => i !== index) });
  };

  const handleSave = async () => {
    if (!place || !id) return;
    if (!place.name.trim()) {
      setSnackbar('Укажите название');
      return;
    }
    setSaving(true);
    try {
      await updatePlace(place);
      router.back();
    } catch (e) {
      setSnackbar('Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  if (!id || loading || !place) {
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
        <Appbar.Content title="Редактирование места" />
      </Appbar.Header>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        <TextInput
          label="Название *"
          value={place.name}
          onChangeText={(t) => setPlace((p) => (p ? { ...p, name: t } : p))}
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Описание"
          value={place.description}
          onChangeText={(t) => setPlace((p) => (p ? { ...p, description: t } : p))}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={styles.input}
        />
        <TextInput
          label="Координаты (широта, долгота)"
          value={place.dd}
          onChangeText={(t) => setPlace((p) => (p ? { ...p, dd: t } : p))}
          mode="outlined"
          placeholder="55.75, 37.62"
          style={styles.input}
        />
        <View style={styles.row}>
          <Text variant="bodyLarge">Посетить позже</Text>
          <Switch
            value={place.visitlater}
            onValueChange={(v) => setPlace((p) => (p ? { ...p, visitlater: v } : p))}
          />
        </View>
        <View style={styles.row}>
          <Text variant="bodyLarge">Понравилось</Text>
          <Switch
            value={place.liked}
            onValueChange={(v) => setPlace((p) => (p ? { ...p, liked: v } : p))}
          />
        </View>
        <Text variant="titleSmall" style={styles.section}>
          Фотографии
        </Text>
        <TouchableOpacity style={styles.addPhoto} onPress={pickImage}>
          <Text>+ Добавить фото</Text>
        </TouchableOpacity>
        {place.photos.length > 0 && (
          <View style={styles.photosRow}>
            {place.photos.map((uri, i) => (
              <TouchableOpacity key={i} onPress={() => removePhoto(i)}>
                <Image source={{ uri }} style={styles.thumb} />
              </TouchableOpacity>
            ))}
          </View>
        )}
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
  section: { marginTop: 16, marginBottom: 8 },
  addPhoto: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#999',
    padding: 24,
    alignItems: 'center',
    borderRadius: 8,
  },
  photosRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  thumb: { width: 80, height: 80, borderRadius: 8 },
  save: { marginTop: 24 },
});
