import { Stack } from 'expo-router';
import 'react-native-reanimated';
import { PaperProvider } from 'react-native-paper';
import { ImageBackground, StyleSheet } from 'react-native';

const backgroundImage = require('../assets/backgrounds/gonext-bg.png');

export default function RootLayout() {
  return (
    <PaperProvider>
      <ImageBackground
        source={backgroundImage}
        style={styles.background}
        resizeMode="cover"
      >
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: 'transparent' },
          }}
        />
      </ImageBackground>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
});
