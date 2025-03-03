import React from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

interface GameCardProps {
  title: string;
  description: string;
  onPress: () => void;
  imageSource?: any;
}

function GameCard({ title, description, onPress, imageSource }: GameCardProps) {
  const cardBackground = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  
  return (
    <TouchableOpacity 
      style={[styles.gameCard, { backgroundColor: cardBackground, borderColor }]} 
      onPress={onPress}
    >
      {imageSource && (
        <Image source={imageSource} style={styles.gameImage} />
      )}
      <ThemedText type="subtitle" style={styles.gameTitle}>{title}</ThemedText>
      <ThemedText style={styles.gameDescription}>{description}</ThemedText>
    </TouchableOpacity>
  );
}

export default function GamesScreen() {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');
  
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Games',
          headerShown: true,
        }}
      />
      
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ThemedText type="title" style={styles.heading}>Choose a Game</ThemedText>
          
          <GameCard 
            title="Wordle"
            description="Guess the 5-letter word in 6 tries with color-coded feedback."
            onPress={() => router.push('/game/wordle')}
            // imageSource={require('@/assets/images/wordle.png')}
          />
          
          <GameCard 
            title="Hangman"
            description="Guess the word letter by letter before the hangman is complete."
            onPress={() => router.push('/game/hangman')}
            // imageSource={require('@/assets/images/hangman.png')}
          />
          
          <GameCard 
            title="Trivia"
            description="Test your knowledge with daily trivia questions."
            onPress={() => router.push('/game/trivia')}
            // imageSource={require('@/assets/images/trivia.png')}
          />
          
          <GameCard 
            title="Minehunter"
            description="Clear the board without hitting any mines."
            onPress={() => router.push('/game/minehunter')}
            // imageSource={require('@/assets/images/minehunter.png')}
          />
          
          <GameCard 
            title="Higher/Lower"
            description="Guess if the next number will be higher or lower."
            onPress={() => router.push('/game/higherlower')}
            // imageSource={require('@/assets/images/higherlower.png')}
          />
        </ScrollView>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  heading: {
    marginBottom: 20,
    textAlign: 'center',
  },
  gameCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gameImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 12,
    resizeMode: 'cover',
  },
  gameTitle: {
    marginBottom: 8,
  },
  gameDescription: {
    opacity: 0.8,
  },
});