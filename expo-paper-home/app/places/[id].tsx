import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, Image } from 'react-native';
import {
  Appbar,
  Card,
  Text,
  TextInput,
  Button,
  Chip,
  ActivityIndicator,
  Snackbar,
} from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getPlaceById, updatePlace } from '@/services';
import { openOnMap, openInNavigator } from '@/utils/map';
import type { Place } from '@/types';
import { useTranslation } from 'react-i18next';

export default function PlaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const p = await getPlaceById(id);
      setPlace(p);
    } catch (e) {
      setSnackbar(t('common.errorLoading'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleMap = async () => {
    if (!place?.dd) {
      setSnackbar(t('places.errorCoordsMissing'));
      return;
    }
    try {
      await openOnMap(place.dd);
    } catch {
      setSnackbar(t('places.errorMapOpen'));
    }
  };

  const handleTravelNotesBlur = async () => {
    if (!place || !id) return;
    setSavingNotes(true);
    try {
      await updatePlace(place);
    } catch {
      setSnackbar(t('places.errorNotesSave'));
    } finally {
      setSavingNotes(false);
    }
  };

  const handleNavigator = async () => {
    if (!place?.dd) {
      setSnackbar(t('places.errorCoordsMissing'));
      return;
    }
    try {
      await openInNavigator(place.dd);
    } catch {
      setSnackbar(t('places.errorNavigatorOpen'));
    }
  };

  if (!id || loading || !place) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title={t('places.detailTitle')} />
        </Appbar.Header>
        <View style={styles.center}>
          {loading ? (
            <ActivityIndicator size="large" />
          ) : (
            <Text>{t('places.detailNotFound')}</Text>
          )}
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
              {place.visitlater && <Chip icon="clock-outline">{t('places.detailVisit')}</Chip>}
              {place.liked && <Chip icon="heart">{t('places.detailLiked')}</Chip>}
            </View>
            {place.description ? (
              <Text variant="bodyLarge" style={styles.desc}>
                {place.description}
              </Text>
            ) : null}
            {place.dd ? (
              <Text variant="bodySmall" style={styles.coords}>
                {t('places.detailCoords', { coords: place.dd })}
              </Text>
            ) : null}
            <TextInput
              label={t('places.detailTravelNotesLabel')}
              value={place.travelNotes ?? ''}
              onChangeText={(t) => setPlace((p) => (p ? { ...p, travelNotes: t } : p))}
              onBlur={handleTravelNotesBlur}
              mode="outlined"
              multiline
              numberOfLines={3}
              placeholder={t('places.detailTravelNotesPlaceholder')}
              style={styles.travelNotes}
              disabled={savingNotes}
            />
          </Card.Content>
          <View style={styles.cardActions}>
            <Button
              onPress={handleMap}
              icon="map"
              mode="outlined"
              style={styles.actionBtn}
            >
              {t('places.detailMap')}
            </Button>
            <Button
              onPress={handleNavigator}
              icon="navigation"
              mode="outlined"
              style={styles.actionBtn}
            >
              {t('places.detailRoute')}
            </Button>
            <Button
              onPress={() => router.push(`/places/${id}/edit` as any)}
              icon="pencil"
              mode="outlined"
              style={styles.actionBtn}
            >
              {t('places.detailEdit')}
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
  travelNotes: { marginTop: 12 },
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
