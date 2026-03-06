import * as React from 'react';
import { useState } from 'react';
import { StyleSheet, View, ScrollView, Image, TouchableOpacity } from 'react-native';
import {
  Appbar,
  TextInput,
  Button,
  Text,
  Switch,
  Snackbar,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { createPlace } from '@/services';
import { savePhoto } from '@/services/photos';
import { logError } from '@/utils/logger';
import { useTranslation } from 'react-i18next';

const EMPTY_PLACE = {
  name: '',
  description: '',
  travelNotes: '',
  visitlater: true,
  liked: false,
  dd: '',
  photos: [] as string[],
};

export default function NewPlaceScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [place, setPlace] = useState(EMPTY_PLACE);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState('');

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      try {
        const path = await savePhoto(result.assets[0].uri);
        setPlace((p) => ({ ...p, photos: [...p.photos, path] }));
      } catch (e) {
        logError('places/new: добавление фото', e);
        setSnackbar(t('places.errorAddPhoto'));
      }
    }
  };

  const handleSave = async () => {
    if (!place.name.trim()) {
      setSnackbar(t('places.errorNameRequired'));
      return;
    }
    setSaving(true);
    try {
      await createPlace({
        ...place,
        travelNotes: place.travelNotes ?? '',
        dd: place.dd || '0,0',
      });
      router.back();
    } catch (e) {
      logError('places/new: сохранение места', e);
      setSnackbar('Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={t('places.newTitle')} />
      </Appbar.Header>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        <TextInput
          label={t('places.formNameLabel')}
          value={place.name}
          onChangeText={(t) => setPlace((p) => ({ ...p, name: t }))}
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label={t('places.formDescriptionLabel')}
          value={place.description}
          onChangeText={(t) => setPlace((p) => ({ ...p, description: t }))}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={styles.input}
        />
        <TextInput
          label={t('places.formTravelNotesLabel')}
          value={place.travelNotes}
          onChangeText={(t) => setPlace((p) => ({ ...p, travelNotes: t }))}
          mode="outlined"
          multiline
          numberOfLines={3}
          placeholder={t('places.formTravelNotesPlaceholder')}
          style={styles.input}
        />
        <TextInput
          label={t('places.formCoordsLabel')}
          value={place.dd}
          onChangeText={(t) => setPlace((p) => ({ ...p, dd: t }))}
          mode="outlined"
          placeholder={t('places.formCoordsPlaceholder')}
          style={styles.input}
        />
        <View style={styles.row}>
          <Text variant="bodyLarge">{t('places.formVisitLater')}</Text>
          <Switch
            value={place.visitlater}
            onValueChange={(v) => setPlace((p) => ({ ...p, visitlater: v }))}
          />
        </View>
        <View style={styles.row}>
          <Text variant="bodyLarge">{t('places.formLiked')}</Text>
          <Switch
            value={place.liked}
            onValueChange={(v) => setPlace((p) => ({ ...p, liked: v }))}
          />
        </View>
        <Text variant="titleSmall" style={styles.section}>
          {t('places.formPhotosSection')}
        </Text>
        <TouchableOpacity style={styles.addPhoto} onPress={pickImage}>
          <Text>{t('places.formAddPhotoWithPlus')}</Text>
        </TouchableOpacity>
        {place.photos.length > 0 && (
          <View style={styles.photosRow}>
            {place.photos.map((uri, i) => (
              <Image key={i} source={{ uri }} style={styles.thumb} />
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
          {t('common.save')}
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
