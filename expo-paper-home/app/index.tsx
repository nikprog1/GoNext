import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { Appbar, Button, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title={t('app.name')} />
      </Appbar.Header>

      <View style={styles.content}>
        <Text variant="headlineSmall" style={styles.title}>
          {t('home.title')}
        </Text>
        <Button
          mode="contained"
          style={styles.button}
          onPress={() => router.push('/places' as any)}
          icon="map-marker"
        >
          {t('home.places')}
        </Button>
        <Button
          mode="contained"
          style={styles.button}
          onPress={() => router.push('/trips' as any)}
          icon="routes"
        >
          {t('home.trips')}
        </Button>
        <Button
          mode="contained"
          style={styles.button}
          onPress={() => router.push('/next-place' as any)}
          icon="map-marker-check"
        >
          {t('home.nextPlace')}
        </Button>
        <Button
          mode="outlined"
          style={styles.button}
          onPress={() => router.push('/settings' as any)}
          icon="cog"
        >
          {t('home.settings')}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    gap: 12,
  },
  title: { marginBottom: 24, textAlign: 'center' },
  button: { marginVertical: 4 },
});
