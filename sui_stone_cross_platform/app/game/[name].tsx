import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

// This is a placeholder for game components
// In a complete implementation, you would import the actual game components
const PlaceholderGame = ({ name }: { name: string }) => {
  return (
    <View style={styles.placeholderContainer}>
      <ThemedText type="title" style={styles.placeholderText}>
        {name} Game
      </ThemedText>
      <ThemedText style={styles.placeholderSubtext}>
        This is a placeholder for the {name} game implementation.
      </ThemedText>
    </View>
  );
};

export default function GameScreen() {
  const { name } = useLocalSearchParams();
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  
  // Convert game name for display
  const gameName = typeof name === 'string' ? name.charAt(0).toUpperCase() + name.slice(1) : 'Game';
  
  const renderGame = () => {
    switch (name) {
      case 'wordle':
        return <PlaceholderGame name="Wordle" />;
      case 'hangman':
        return <PlaceholderGame name="Hangman" />;
      case 'trivia':
        return <PlaceholderGame name="Trivia" />;
      case 'minehunter':
        return <PlaceholderGame name="Minehunter" />;
      case 'higherlower':
        return <PlaceholderGame name="Higher/Lower" />;
      default:
        return <PlaceholderGame name="Unknown" />;
    }
  };
  
  return (
    <>
      <Stack.Screen options={{ title: gameName, headerShown: true }} />
      
      <ThemedView style={[styles.container, { backgroundColor }]}>
        {renderGame()}
        
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: tintColor }]}
          onPress={() => router.back()}
        >
          <ThemedText style={styles.backButtonText}>Back to Games</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  placeholderText: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  placeholderSubtext: {
    textAlign: 'center',
    opacity: 0.7,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});