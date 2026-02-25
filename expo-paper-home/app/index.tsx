import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { Appbar, Button, Snackbar, Text } from 'react-native-paper';

export default function HomeScreen() {
  const [snackbarVisible, setSnackbarVisible] = React.useState(false);

  const handlePress = () => {
    setSnackbarVisible(true);
  };

  const handleDismiss = () => {
    setSnackbarVisible(false);
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="GoNext" />
      </Appbar.Header>

      <View style={styles.content}>
        <Text variant="titleMedium">Привет, Николай!</Text>
        <Button mode="contained" style={styles.button} onPress={handlePress}>
          Нажми меня
        </Button>
      </View>

      <Snackbar visible={snackbarVisible} onDismiss={handleDismiss} duration={2000}>
        Кнопка нажата
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  button: {
    marginTop: 16,
  },
});

