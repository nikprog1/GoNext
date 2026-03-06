import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, FlatList, RefreshControl } from 'react-native';
import {
  Appbar,
  List,
  FAB,
  Text,
  ActivityIndicator,
  Snackbar,
  Chip,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { getAllTrips } from '@/services';
import type { Trip } from '@/types';
import { useTranslation } from 'react-i18next';

export default function TripsListScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbar, setSnackbar] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await getAllTrips();
      setTrips(data);
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

  const formatDate = (d: string) => new Date(d).toLocaleDateString('ru-RU');
  // TODO: при необходимости можно локализовать формат даты отдельно

  const renderItem = ({ item }: { item: Trip }) => (
    <List.Item
      title={item.title}
      description={`${formatDate(item.startDate)} — ${formatDate(item.endDate)}`}
      left={(props) => <List.Icon {...props} icon="routes" />}
      right={() =>
        item.current ? (
          <Chip compact style={styles.chip}>
            {t('trips.chipCurrent')}
          </Chip>
        ) : null
      }
      onPress={() => router.push(`/trips/${item.id}` as any)}
    />
  );

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={t('trips.listTitle')} />
      </Appbar.Header>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      ) : trips.length === 0 ? (
        <View style={styles.center}>
          <Text variant="bodyLarge">{t('trips.emptyTitle')}</Text>
          <Text variant="bodyMedium" style={styles.hint}>
            {t('trips.emptyHint')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={trips}
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
        onPress={() => router.push('/trips/new' as any)}
        label={t('trips.fabCreate')}
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
  chip: { alignSelf: 'center', marginRight: 8 },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});
