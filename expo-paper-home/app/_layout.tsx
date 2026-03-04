import { Stack } from 'expo-router';
import 'react-native-reanimated';
import { PaperProvider } from 'react-native-paper';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { ThemeProvider, useThemeContext } from '@/context/ThemeProvider';
import { Colors } from '@/constants/theme';

const backgroundImage = require('../assets/backgrounds/gonext-bg.png');

function RootLayoutInner() {
  const { paperTheme, mode } = useThemeContext();
  const isLight = mode === 'light';

  const content = (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
      }}
    />
  );

  return (
    <PaperProvider theme={paperTheme}>
      {isLight ? (
        <ImageBackground
          source={backgroundImage}
          style={styles.background}
          resizeMode="cover"
        >
          {content}
        </ImageBackground>
      ) : (
        <View style={styles.darkBackground}>{content}</View>
      )}
    </PaperProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutInner />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  darkBackground: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
});
