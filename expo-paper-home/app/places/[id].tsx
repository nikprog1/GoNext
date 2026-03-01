import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, Image } from 'react-native';
import {
  Appbar,
  Card,
  Text,
  Button,
  Chip,
  ActivityIndicator,
  Snackbar,
} from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getPlaceById } from '@/services';
import { openOnMap, openInNavigator } from '@/utils/map';
import type { Place } from '@/types';

export default function PlaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
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

  const handleMap = async () => {
    if (!place?.dd) {
      setSnackbar('Координаты не указаны');
      return;
    }
    try {
      await openOnMap(place.dd);
    } catch {
      setSnackbar('Не удалось открыть карту');
    }
  };

  const handleNavigator = async () => {
    if (!place?.dd) {
      setSnackbar('Координаты не указаны');
      return;
    }
    try {
      await openInNavigator(place.dd);
    } catch {
      setSnackbar('Не удалось открыть навигатор');
    }
  };

  if (!id || loading || !place) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Место" />
        </Appbar.Header>
        <View style={styles.center}>
          {loading ? <ActivityIndicator size="large" /> : <Text>Не найдено</Text>}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={place.name} />
        <Appbar.Action icon="pencil" onPress={() => router.push(`/places/${id}/edit` as any)} />
      </Appbar.Header>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        {place.photos?.[0] && (
          <Image source={{ uri: place.photos[0] }} style={styles.photo} resizeMode="cover" />
        )}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.chips}>
              {place.visitlater && <Chip icon="clock-outline">Посетить</Chip>}
              {place.liked && <Chip icon="heart">Понравилось</Chip>}
            </View>
            {place.description ? (
              <Text variant="bodyLarge" style={styles.desc}>
                {place.description}
              </Text>
            ) : null}
            {place.dd ? (
              <Text variant="bodySmall" style={styles.coords}>
                Координаты: {place.dd}
              </Text>
            ) : null}
          </Card.Content>
          <View style={styles.cardActions}>
            <Button
              onPress={handleMap}
              icon="map"
              mode="outlined"
              style={styles.actionBtn}
            >
              Карта
            </Button>
            <Button
              onPress={handleNavigator}
              icon="navigation"
              mode="outlined"
              style={styles.actionBtn}
            >
              Маршрут
            </Button>
            <Button
              onPress={() => router.push(`/places/${id}/edit` as any)}
              icon="pencil"
              mode="outlined"
              style={styles.actionBtn}
            >
              Редактировать
            </Button>
          </View>
        </Card>
        {place.photos && place.photos.length > 1 && (
          <View style={styles.photosRow}>
            {place.photos.slice(1, 5).map((uri, i) => (
              <Image key={i} source={{ uri }} style={styles.thumb} />
            ))}
          </View>
        )}
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
  contentInner: { paddingBottom: 24 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  photo: { width: '100%', height: 200 },
  card: { margin: 16 },
  chips: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  desc: { marginBottom: 8 },
  coords: { color: '#666' },
  cardActions: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  actionBtn: {
    marginVertical: 4,
    alignSelf: 'stretch',
  },
  photosRow: { flexDirection: 'row', flexWrap: 'wrap', padding: 16, gap: 8 },
  thumb: { width: 80, height: 80, borderRadius: 8 },
});
