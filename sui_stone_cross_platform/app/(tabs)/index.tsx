import { StyleSheet, View, Platform, Image } from 'react-native';
import { Link } from 'expo-router';

import { HelloWave } from '@/components/HelloWave';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Experience3D } from '@/components/Experience3D';

export default function HomeScreen() {
  return (
    // <View style={styles.container}>
      /* <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome to SuiStone!</ThemedText>
        <HelloWave />
      </ThemedView> */
      
      <Experience3D />
      
      /* <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Play Now</ThemedText>
        <ThemedText>
          Check out our collection of games by tapping the Games tab or using the button below.
        </ThemedText>
        <Link href="/games" style={styles.button}>
          <ThemedText style={styles.buttonText}>Play Games</ThemedText>
        </Link>
      </ThemedView>
      
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Leaderboards</ThemedText>
        <ThemedText>
          View the top players and their scores on our leaderboards.
        </ThemedText>
        <Link href="/leaderboard" style={styles.button}>
          <ThemedText style={styles.buttonText}>View Leaderboards</ThemedText>
        </Link>
      </ThemedView>
      
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Connect Wallet</ThemedText>
        <ThemedText>
          Connect your Sui wallet to track your scores and achievements.
        </ThemedText>
      </ThemedView> */
    // </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // width: '100%',
    // height: 250,
    // marginBottom: 20
    padding: 50
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  stepContainer: {
    gap: 12,
    marginBottom: 20,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  button: {
    backgroundColor: '#0088cc',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  }
});
