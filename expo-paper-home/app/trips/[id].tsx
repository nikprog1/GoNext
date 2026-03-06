import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl, Image } from 'react-native';
import {
  Appbar,
  Card,
  Text,
  TextInput,
  Button,
  List,
  ActivityIndicator,
  Snackbar,
  SegmentedButtons,
  Checkbox,
  Dialog,
  Portal,
} from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  getTripById,
  getPlaceById,
  setCurrentTrip,
  updateTripPlace,
  removePlaceFromTrip,
  addPlaceToTrip,
  getAllPlaces,
  reorderTripPlaces,
} from '@/services';
import { openOnMap, openInNavigator } from '@/utils/map';
import type { Trip, TripPlace, Place } from '@/types';
import * as ImagePicker from 'expo-image-picker';
import { savePhoto } from '@/services/photos';
import { useTranslation } from 'react-i18next';

type ViewMode = 'plan' | 'diary';

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [placesMap, setPlacesMap] = useState<Record<string, Place>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('plan');
  const [snackbar, setSnackbar] = useState('');
  const [addPlaceVisible, setAddPlaceVisible] = useState(false);
  const [allPlaces, setAllPlaces] = useState<Place[]>([]);
  const [addingPlaceId, setAddingPlaceId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const t = await getTripById(id);
      setTrip(t);
      if (t) {
        const map: Record<string, Place> = {};
        for (const tp of t.places) {
          const p = await getPlaceById(tp.placeId);
          if (p) map[tp.placeId] = p;
        }
        setPlacesMap(map);
      }
    } catch (e) {
      setSnackbar(t('common.errorLoading'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const handleSetCurrent = async () => {
    if (!id) return;
    try {
      await setCurrentTrip(id);
      setTrip((t) => (t ? { ...t, current: true } : null));
      setSnackbar(t('trips.detailSetCurrent'));
    } catch (e) {
      setSnackbar(t('trips.errorGeneric'));
    }
  };

  const handleToggleVisited = async (tripPlace: TripPlace) => {
    if (!id) return;
    const next = !tripPlace.visited;
    try {
      await updateTripPlace(id, tripPlace.placeId, {
        visited: next,
        visitDate: next ? new Date().toISOString().slice(0, 10) : null,
      });
      await load();
    } catch (e) {
      setSnackbar(t('trips.errorGeneric'));
    }
  };

  const openAddPlace = async () => {
    try {
      const all = await getAllPlaces();
      setAllPlaces(all);
      setAddPlaceVisible(true);
    } catch (e) {
      setSnackbar(t('trips.errorLoadPlaces'));
    }
  };

  const handleAddPlace = async (place: Place) => {
    if (!id) return;
    setAddingPlaceId(place.id);
    try {
      await addPlaceToTrip(id, place);
      setAddPlaceVisible(false);
      await load();
      setSnackbar(t('trips.errorPlaceAdded'));
    } catch (e) {
      setSnackbar(t('trips.errorAddPlace'));
    } finally {
      setAddingPlaceId(null);
    }
  };

  const handleRemovePlace = async (placeId: string) => {
    if (!id) return;
    try {
      await removePlaceFromTrip(id, placeId);
      await load();
      setSnackbar(t('trips.errorPlaceRemoved'));
    } catch (e) {
      setSnackbar(t('trips.errorGeneric'));
    }
  };

  const handleMovePlace = async (placeId: string, direction: 'up' | 'down') => {
    if (!id || !trip) return;
    const index = trip.places.findIndex((tp) => tp.placeId === placeId);
    if (index === -1) return;
    const swapWith = direction === 'up' ? index - 1 : index + 1;
    if (swapWith < 0 || swapWith >= trip.places.length) return;

    const reordered = [...trip.places];
    [reordered[index], reordered[swapWith]] = [reordered[swapWith], reordered[index]];
    const ids = reordered.map((tp) => tp.placeId);

    try {
      await reorderTripPlaces(id, ids);
      await load();
    } catch (e) {
      setSnackbar(t('trips.errorReorder'));
    }
  };

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('ru-RU') : '';
  // TODO: при необходимости можно локализовать формат даты отдельно

  if (!id || loading || !trip) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title={t('trips.detailTitle')} />
        </Appbar.Header>
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      </View>
    );
  }

  const placesToShow = trip.places.filter((tp) => {
    if (viewMode === 'plan') return true;
    return tp.visited;
  });

  const availablePlaces = allPlaces.filter(
    (p) => !trip.places.some((tp) => tp.placeId === p.id)
  );

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={trip.title} />
        <Appbar.Action icon="pencil" onPress={() => router.push(`/trips/${id}/edit` as any)} />
      </Appbar.Header>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="bodyMedium">
              {trip.description || t('trips.detailNoDescription')}
            </Text>
            <Text variant="bodySmall" style={styles.dates}>
              {formatDate(trip.startDate)} — {formatDate(trip.endDate)}
            </Text>
            {!trip.current && (
              <Button mode="outlined" onPress={handleSetCurrent} style={styles.setCurrent}>
                {t('trips.detailSetCurrent')}
              </Button>
            )}
          </Card.Content>
        </Card>

        <View style={styles.segmented}>
          <SegmentedButtons
            value={viewMode}
            onValueChange={(v) => setViewMode(v as ViewMode)}
            buttons={[
              { value: 'plan', label: t('trips.detailPlan') },
              { value: 'diary', label: t('trips.detailDiary') },
            ]}
          />
        </View>

        <View style={styles.headerRow}>
          <Text variant="titleMedium">{t('trips.detailRouteHeader')}</Text>
          <Button mode="text" onPress={openAddPlace} icon="plus">
            {t('trips.detailAddPlace')}
          </Button>
        </View>

        {trip.places.length === 0 ? (
          <Text variant="bodyMedium" style={styles.empty}>
            {t('trips.detailEmptyRoute')}
          </Text>
        ) : (
          placesToShow.map((tp) => {
            const place = placesMap[tp.placeId];
            if (!place) return null;
            return (
              <PlaceInTripRow
                key={tp.placeId}
                tripId={id}
                place={place}
                tripPlace={tp}
                viewMode={viewMode}
                onToggleVisited={() => handleToggleVisited(tp)}
                onMap={() => place.dd && openOnMap(place.dd)}
                onNav={() => place.dd && openInNavigator(place.dd)}
                onRemove={() => handleRemovePlace(tp.placeId)}
                  onMoveUp={() => handleMovePlace(tp.placeId, 'up')}
                  onMoveDown={() => handleMovePlace(tp.placeId, 'down')}
                onNotesSaved={load}
              />
            );
          })
        )}
      </ScrollView>

      <Portal>
        <Dialog visible={addPlaceVisible} onDismiss={() => setAddPlaceVisible(false)}>
          <Dialog.Title>{t('trips.dialogAddPlaceTitle')}</Dialog.Title>
          <Dialog.ScrollArea style={styles.dialogScroll}>
            {availablePlaces.length === 0 ? (
              <Text variant="bodyMedium" style={styles.emptyPlaces}>
                {t('trips.dialogAddPlaceEmpty')}
              </Text>
            ) : (
              availablePlaces.map((item) => (
                <List.Item
                  key={item.id}
                  title={item.name}
                  onPress={() => handleAddPlace(item)}
                  right={() =>
                    addingPlaceId === item.id ? (
                      <ActivityIndicator size="small" style={styles.addingSpinner} />
                    ) : (
                      <List.Icon icon="plus" />
                    )
                  }
                />
              ))
            )}
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setAddPlaceVisible(false)}>
              {t('trips.dialogAddPlaceClose')}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar visible={!!snackbar} onDismiss={() => setSnackbar('')} duration={2000}>
        {snackbar}
      </Snackbar>
    </View>
  );
}

function PlaceInTripRow({
  tripId,
  place,
  tripPlace,
  viewMode,
  onToggleVisited,
  onMap,
  onNav,
  onRemove,
  onMoveUp,
  onMoveDown,
  onNotesSaved,
}: {
  tripId: string;
  place: Place;
  tripPlace: TripPlace;
  viewMode: ViewMode;
  onToggleVisited: () => void;
  onMap: () => void;
  onNav: () => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onNotesSaved: () => void;
}) {
  const { t } = useTranslation();
  const [notesVisible, setNotesVisible] = useState(false);
  const [notes, setNotes] = useState(tripPlace.notes);
  const [savingNotes, setSavingNotes] = useState(false);
  const [photosVisible, setPhotosVisible] = useState(false);
  const [photos, setPhotos] = useState<string[]>(tripPlace.photos ?? []);
  const [savingPhoto, setSavingPhoto] = useState(false);

  React.useEffect(() => {
    setNotes(tripPlace.notes);
  }, [tripPlace.notes]);

  React.useEffect(() => {
    setPhotos(tripPlace.photos ?? []);
  }, [tripPlace.photos]);

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('ru-RU') : '';

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      await updateTripPlace(tripId, tripPlace.placeId, { notes });
      setNotesVisible(false);
      onNotesSaved();
    } catch {
      // ignore
    } finally {
      setSavingNotes(false);
    }
  };

  const handleAddPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]?.uri) return;
    setSavingPhoto(true);
    try {
      const path = await savePhoto(result.assets[0].uri);
      const nextPhotos = [...photos, path];
      setPhotos(nextPhotos);
      await updateTripPlace(tripId, tripPlace.placeId, { photos: nextPhotos });
      onNotesSaved();
    } catch {
      // ignore
    } finally {
      setSavingPhoto(false);
    }
  };

  return (
    <>
      <Card style={styles.placeCard}>
        <Card.Content>
          <View style={styles.placeRow}>
            {viewMode === 'plan' && (
              <Checkbox
                status={tripPlace.visited ? 'checked' : 'unchecked'}
                onPress={onToggleVisited}
              />
            )}
            <View style={styles.placeInfo}>
              <Text variant="titleMedium">{place.name}</Text>
              {viewMode === 'diary' && tripPlace.visitDate && (
                <Text variant="bodySmall">
                  {t('trips.placeVisitedLabel', {
                    date: formatDate(tripPlace.visitDate),
                  })}
                </Text>
              )}
              {tripPlace.notes ? (
                <Text variant="bodySmall" style={styles.notes}>
                  {tripPlace.notes}
                </Text>
              ) : null}
            </View>
          </View>
        </Card.Content>
        <View style={styles.cardActions}>
          <Button onPress={onMoveUp} icon="chevron-up" compact style={styles.actionBtn}>
            {t('trips.placeMoveUp')}
          </Button>
          <Button onPress={onMoveDown} icon="chevron-down" compact style={styles.actionBtn}>
            {t('trips.placeMoveDown')}
          </Button>
          <Button onPress={onMap} icon="map" compact style={styles.actionBtn}>
            {t('trips.placeMap')}
          </Button>
          <Button onPress={onNav} icon="navigation" compact style={styles.actionBtn}>
            {t('trips.placeRoute')}
          </Button>
          <Button
            onPress={() => setNotesVisible(true)}
            icon="pencil"
            compact
            style={styles.actionBtn}
          >
            {t('trips.placeNotes')}
          </Button>
          <Button
            onPress={() => setPhotosVisible(true)}
            icon="image"
            compact
            style={styles.actionBtn}
          >
            {t('trips.placePhotos')}
          </Button>
          <Button
            onPress={onRemove}
            icon="delete"
            compact
            textColor="#c62828"
            style={styles.actionBtn}
          >
            {t('trips.placeDelete')}
          </Button>
        </View>
      </Card>

      <Portal>
        <Dialog visible={notesVisible} onDismiss={() => setNotesVisible(false)}>
          <Dialog.Title>
            {t('trips.notesDialogTitle', { name: place.name })}
          </Dialog.Title>
          <Dialog.Content>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              mode="outlined"
              multiline
              numberOfLines={4}
              placeholder={t('trips.notesPlaceholder')}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setNotesVisible(false)}>{t('common.cancel')}</Button>
            <Button onPress={handleSaveNotes} loading={savingNotes} disabled={savingNotes}>
              {t('common.save')}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <Portal>
        <Dialog visible={photosVisible} onDismiss={() => setPhotosVisible(false)}>
          <Dialog.Title>
            {t('trips.photosDialogTitle', { name: place.name })}
          </Dialog.Title>
          <Dialog.ScrollArea style={styles.dialogScroll}>
            <ScrollView horizontal contentContainerStyle={styles.photosRow}>
              {photos.length === 0 ? (
                <Text variant="bodyMedium" style={styles.empty}>
                  {t('trips.photosEmpty')}
                </Text>
              ) : (
                photos.map((uri, index) => (
                  <Image key={index} source={{ uri }} style={styles.photoThumb} />
                ))
              )}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={handleAddPhoto} loading={savingPhoto} disabled={savingPhoto}>
              {t('trips.photosAdd')}
            </Button>
            <Button onPress={() => setPhotosVisible(false)}>
              {t('trips.photosClose')}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  contentInner: { padding: 16, paddingBottom: 32 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { marginBottom: 16 },
  dates: { marginTop: 4, color: '#666' },
  setCurrent: { marginTop: 8 },
  segmented: { marginBottom: 16 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  empty: { color: '#666', marginTop: 8 },
  emptyPlaces: { padding: 24, color: '#666' },
  placeCard: { marginBottom: 12 },
  cardActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  actionBtn: {
    marginHorizontal: 2,
    marginVertical: 2,
    minWidth: 0,
  },
  placeRow: { flexDirection: 'row', alignItems: 'flex-start' },
  placeInfo: { flex: 1, marginLeft: 8 },
  notes: { marginTop: 4, color: '#666' },
  dialogScroll: { maxHeight: 300 },
  addingSpinner: { alignSelf: 'center' },
});
