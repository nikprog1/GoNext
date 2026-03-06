import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, FlatList, RefreshControl, Image } from 'react-native';
import { Appbar, List, FAB, Text, ActivityIndicator, Snackbar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { getAllPlaces } from '@/services';
import type { Place } from '@/types';
import { useTranslation } from 'react-i18next';

export default function PlacesListScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbar, setSnackbar] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await getAllPlaces();
      setPlaces(data);
    } catch (e) {
      setSnackbar(t('common.errorLoading'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const renderItem = ({ item }: { item: Place }) => (
    <List.Item
      title={item.name}
      description={item.description || undefined}
      left={() =>
        item.photos?.[0] ? (
          <Image source={{ uri: item.photos[0] }} style={styles.thumb} />
        ) : (
          <List.Icon icon="map-marker" />
        )
      }
      right={(props) => <List.Icon {...props} icon="chevron-right" />}
      onPress={() => router.push(`/places/${item.id}` as any)}
    />
  );

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={t('places.listTitle')} />
      </Appbar.Header>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      ) : places.length === 0 ? (
        <View style={styles.center}>
          <Text variant="bodyLarge">{t('places.emptyTitle')}</Text>
          <Text variant="bodyMedium" style={styles.hint}>
            {t('places.emptyHint')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={places}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/places/new' as any)}
        label={t('places.addButton')}
      />

      <Snackbar visible={!!snackbar} onDismiss={() => setSnackbar('')} duration={2000}>
        {snackbar}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  hint: { marginTop: 8, color: '#666' },
  thumb: { width: 48, height: 48, borderRadius: 8, marginRight: 12 },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});
