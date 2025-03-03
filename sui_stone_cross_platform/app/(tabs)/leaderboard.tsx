import React, { useState } from 'react';
import { StyleSheet, FlatList, View } from 'react-native';
import { Stack } from 'expo-router';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Tabs, TabScreen } from 'react-native-paper-tabs';

// Mock data - would be fetched from API in real implementation
const MOCK_LEADERBOARD = {
  wordle: [
    { id: '1', username: 'Player1', score: 950, wallet: '0x7f...a3b2' },
    { id: '2', username: 'Player2', score: 875, wallet: '0x3d...c1f5' },
    { id: '3', username: 'Player3', score: 810, wallet: '0x9e...7d3a' },
    { id: '4', username: 'Player4', score: 790, wallet: '0x1a...b8c2' },
    { id: '5', username: 'Player5', score: 760, wallet: '0x5f...e2d1' },
  ],
  hangman: [
    { id: '1', username: 'Player3', score: 1200, wallet: '0x9e...7d3a' },
    { id: '2', username: 'Player1', score: 1050, wallet: '0x7f...a3b2' },
    { id: '3', username: 'Player5', score: 980, wallet: '0x5f...e2d1' },
    { id: '4', username: 'Player2', score: 920, wallet: '0x3d...c1f5' },
    { id: '5', username: 'Player4', score: 880, wallet: '0x1a...b8c2' },
  ],
  trivia: [
    { id: '1', username: 'Player2', score: 1500, wallet: '0x3d...c1f5' },
    { id: '2', username: 'Player5', score: 1350, wallet: '0x5f...e2d1' },
    { id: '3', username: 'Player1', score: 1290, wallet: '0x7f...a3b2' },
    { id: '4', username: 'Player4', score: 1170, wallet: '0x1a...b8c2' },
    { id: '5', username: 'Player3', score: 1100, wallet: '0x9e...7d3a' },
  ],
  minehunter: [
    { id: '1', username: 'Player4', score: 2500, wallet: '0x1a...b8c2' },
    { id: '2', username: 'Player2', score: 2350, wallet: '0x3d...c1f5' },
    { id: '3', username: 'Player5', score: 2200, wallet: '0x5f...e2d1' },
    { id: '4', username: 'Player1', score: 2050, wallet: '0x7f...a3b2' },
    { id: '5', username: 'Player3', score: 1950, wallet: '0x9e...7d3a' },
  ],
  higherlower: [
    { id: '1', username: 'Player5', score: 1800, wallet: '0x5f...e2d1' },
    { id: '2', username: 'Player3', score: 1720, wallet: '0x9e...7d3a' },
    { id: '3', username: 'Player1', score: 1680, wallet: '0x7f...a3b2' },
    { id: '4', username: 'Player4', score: 1620, wallet: '0x1a...b8c2' },
    { id: '5', username: 'Player2', score: 1580, wallet: '0x3d...c1f5' },
  ],
};

interface LeaderboardItemProps {
  rank: number;
  username: string;
  score: number;
  wallet: string;
}

function LeaderboardItem({ rank, username, score, wallet }: LeaderboardItemProps) {
  const accentColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');
  
  return (
    <View style={[styles.leaderboardItem, { borderBottomColor: borderColor }]}>
      <ThemedText style={[styles.rank, { color: accentColor }]}>#{rank}</ThemedText>
      <View style={styles.userInfo}>
        <ThemedText style={styles.username}>{username}</ThemedText>
        <ThemedText style={styles.wallet}>{wallet}</ThemedText>
      </View>
      <ThemedText style={styles.score}>{score}</ThemedText>
    </View>
  );
}

export default function LeaderboardScreen() {
  const [selectedGame, setSelectedGame] = useState('wordle');
  const backgroundColor = useThemeColor({}, 'background');
  const accentColor = useThemeColor({}, 'tint');
  
  const renderLeaderboard = (game: string) => {
    return (
      <FlatList
        data={MOCK_LEADERBOARD[game as keyof typeof MOCK_LEADERBOARD]}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <LeaderboardItem
            rank={index + 1}
            username={item.username}
            score={item.score}
            wallet={item.wallet}
          />
        )}
        contentContainerStyle={styles.listContent}
      />
    );
  };
  
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Leaderboard',
          headerShown: true,
        }}
      />
      
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <ThemedText type="title" style={styles.heading}>Game Leaderboards</ThemedText>
        
        <View style={styles.tabContainer}>
          <ThemedText 
            style={[styles.tabText, selectedGame === 'wordle' && { color: accentColor }]}
            onPress={() => setSelectedGame('wordle')}
          >
            Wordle
          </ThemedText>
          <ThemedText 
            style={[styles.tabText, selectedGame === 'hangman' && { color: accentColor }]}
            onPress={() => setSelectedGame('hangman')}
          >
            Hangman
          </ThemedText>
          <ThemedText 
            style={[styles.tabText, selectedGame === 'trivia' && { color: accentColor }]}
            onPress={() => setSelectedGame('trivia')}
          >
            Trivia
          </ThemedText>
          <ThemedText 
            style={[styles.tabText, selectedGame === 'minehunter' && { color: accentColor }]}
            onPress={() => setSelectedGame('minehunter')}
          >
            Minehunter
          </ThemedText>
          <ThemedText 
            style={[styles.tabText, selectedGame === 'higherlower' && { color: accentColor }]}
            onPress={() => setSelectedGame('higherlower')}
          >
            Higher/Lower
          </ThemedText>
        </View>
        
        <View style={styles.leaderboardContainer}>
          <View style={styles.headerRow}>
            <ThemedText style={styles.headerRank}>Rank</ThemedText>
            <ThemedText style={styles.headerUsername}>Player</ThemedText>
            <ThemedText style={styles.headerScore}>Score</ThemedText>
          </View>
          
          {renderLeaderboard(selectedGame)}
        </View>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  heading: {
    marginBottom: 20,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  tabText: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
    marginBottom: 8,
    borderRadius: 16,
    overflow: 'hidden',
    fontSize: 14,
    fontWeight: '500',
  },
  leaderboardContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#0088cc',
  },
  headerRank: {
    width: 50,
    fontWeight: 'bold',
  },
  headerUsername: {
    flex: 1,
    fontWeight: 'bold',
  },
  headerScore: {
    width: 80,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: 20,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  rank: {
    width: 50,
    fontSize: 16,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '500',
  },
  wallet: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
  score: {
    width: 80,
    textAlign: 'right',
    fontSize: 18,
    fontWeight: 'bold',
  },
});