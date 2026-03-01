import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Appbar, Button, Card, Text, Snackbar, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { getNextPlace } from '@/services';
import { openOnMap, openInNavigator } from '@/utils/map';

export default function NextPlaceScreen() {
  const router = useRouter();
  const [data, setData] = useState<Awaited<ReturnType<typeof getNextPlace>>>(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getNextPlace();
      setData(result);
    } catch (e) {
      setSnackbar('Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleMap = async () => {
    if (!data?.place.dd) {
      setSnackbar('Координаты не указаны');
      return;
    }
    try {
      await openOnMap(data.place.dd);
    } catch {
      setSnackbar('Не удалось открыть карту');
    }
  };

  const handleNavigator = async () => {
    if (!data?.place.dd) {
      setSnackbar('Координаты не указаны');
      return;
    }
    try {
      await openInNavigator(data.place.dd);
    } catch {
      setSnackbar('Не удалось открыть навигатор');
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Следующее место" />
      </Appbar.Header>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      ) : !data ? (
        <View style={styles.center}>
          <Text variant="bodyLarge">Нет следующего места</Text>
          <Text variant="bodyMedium" style={styles.hint}>
            Выберите текущую поездку и добавьте в неё места
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
          <Card>
            <Card.Content>
              <Text variant="headlineSmall">{data.place.name}</Text>
              <Text variant="bodyMedium" style={styles.tripTitle}>
                Поездка: {data.trip.title}
              </Text>
              {data.place.description ? (
                <Text variant="bodyMedium" style={styles.desc}>
                  {data.place.description}
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
                onPress={() => router.push(`/places/${data.place.id}` as any)}
                icon="information"
                mode="outlined"
                style={styles.actionBtn}
              >
                Подробнее
              </Button>
            </View>
          </Card>
        </ScrollView>
      )}

      <Snackbar visible={!!snackbar} onDismiss={() => setSnackbar('')} duration={2500}>
        {snackbar}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  contentInner: { padding: 16 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  hint: { marginTop: 8, color: '#666', textAlign: 'center' },
  tripTitle: { marginTop: 4, color: '#666' },
  desc: { marginTop: 8 },
  cardActions: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  actionBtn: {
    marginVertical: 4,
    alignSelf: 'stretch',
  },
});
