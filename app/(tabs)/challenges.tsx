import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChallengeCard } from '@/components/ChallengeCard';
import {
  useChallenges,
  Challenge,
  CreateChallengeRequest,
} from '@/hooks/useChallenges';
import { BoltCard } from '@/components/design-system/BoltCard';
import { LightningButton } from '@/components/design-system/LightningButton';

export default function ChallengesScreen() {
  const {
    challenges,
    myChallenges,
    publicChallenges,
    loading,
    error,
    joinChallenge,
    createChallenge,
    loadChallenges,
    loadMyChallenges,
    loadPublicChallenges,
    getChallengeSuggestions,
  } = useChallenges();

  const [activeTab, setActiveTab] = useState<'my' | 'public' | 'suggestions'>(
    'my'
  );
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
      loadChallenges(),
      loadMyChallenges(),
      loadPublicChallenges(),
    ]);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleJoinChallenge = async (challengeId: string) => {
    const success = await joinChallenge(challengeId);
    if (success) {
      Alert.alert('Success!', "You've joined the challenge! 🎉");
      await loadData();
    } else {
      Alert.alert('Error', 'Failed to join challenge. Please try again.');
    }
  };

  const handleCreateSuggestedChallenge = async (
    suggestion: CreateChallengeRequest
  ) => {
    Alert.alert('Create Challenge', `Create "${suggestion.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Create',
        onPress: async () => {
          const success = await createChallenge(suggestion);
          if (success) {
            Alert.alert('Success!', 'Challenge created! 🚀');
            await loadData();
            setActiveTab('my');
          } else {
            Alert.alert('Error', 'Failed to create challenge.');
          }
        },
      },
    ]);
  };

  const handleViewChallenge = (challenge: Challenge) => {
    // TODO: Navigate to challenge detail screen
    Alert.alert(challenge.title, challenge.description, [{ text: 'OK' }]);
  };

  const renderTabButton = (
    tab: 'my' | 'public' | 'suggestions',
    label: string,
    count?: number
  ) => (
    <LightningButton
      variant={activeTab === tab ? "primary" : "ghost"}
      size="small"
      onPress={() => setActiveTab(tab)}
      style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
    >
      {label}
      {count !== undefined && ` (${count})`}
    </LightningButton>
  );

  const renderMyChallenges = () => (
    <View style={styles.content}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>My Active Challenges</Text>
        <Text style={styles.sectionSubtitle}>
          Track your progress and stay motivated
        </Text>
      </View>

      {challenges.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>🎯</Text>
          <Text style={styles.emptyStateTitle}>No Active Challenges</Text>
          <Text style={styles.emptyStateText}>
            Join a challenge to compete with others and push your limits!
          </Text>
          <LightningButton
            variant="primary"
            size="medium"
            onPress={() => setActiveTab('public')}
            style={styles.emptyStateButton}
          >
            Browse Challenges
          </LightningButton>
        </View>
      ) : (
        challenges.map((challenge) => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            userParticipation={true}
            onView={handleViewChallenge}
          />
        ))
      )}

      {myChallenges.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Challenges I Created</Text>
          </View>
          {myChallenges.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              onView={handleViewChallenge}
            />
          ))}
        </>
      )}
    </View>
  );

  const renderPublicChallenges = () => (
    <View style={styles.content}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Join Public Challenges</Text>
        <Text style={styles.sectionSubtitle}>Compete with the community</Text>
      </View>

      {publicChallenges.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>🌟</Text>
          <Text style={styles.emptyStateTitle}>No Public Challenges</Text>
          <Text style={styles.emptyStateText}>
            Be the first to create a challenge for the community!
          </Text>
        </View>
      ) : (
        publicChallenges.map((challenge) => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            onJoin={handleJoinChallenge}
            onView={handleViewChallenge}
          />
        ))
      )}
    </View>
  );

  const renderSuggestions = () => {
    const suggestions = getChallengeSuggestions();

    return (
      <View style={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Challenge Suggestions</Text>
          <Text style={styles.sectionSubtitle}>
            Popular challenges to help you stay motivated
          </Text>
        </View>

        {suggestions.map((suggestion, index) => {
          const mockChallenge: Challenge = {
            id: `suggestion_${index}`,
            creator_id: '',
            title: suggestion.title,
            description: suggestion.description,
            challenge_type: suggestion.challenge_type,
            target_value: suggestion.target_value,
            start_date: new Date().toISOString(),
            end_date: new Date(
              Date.now() + suggestion.duration_days * 24 * 60 * 60 * 1000
            ).toISOString(),
            is_public: suggestion.is_public,
            xp_reward: suggestion.xp_reward || 100,
            created_at: new Date().toISOString(),
            creator: { username: 'BoltFit', avatar_color: 'purple' },
            participants_count: Math.floor(Math.random() * 50) + 10,
          };

          return (
            <View key={index} style={styles.suggestionContainer}>
              <ChallengeCard
                challenge={mockChallenge}
                onView={() => handleCreateSuggestedChallenge(suggestion)}
              />
              <LightningButton
                variant="secondary"
                size="medium"
                onPress={() => handleCreateSuggestedChallenge(suggestion)}
                style={styles.createSuggestionButton}
              >
                Create This Challenge
              </LightningButton>
            </View>
          );
        })}
      </View>
    );
  };

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <BoltCard variant="glass" style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorText}>{error}</Text>
          <LightningButton
            variant="primary"
            size="medium"
            onPress={handleRefresh}
            style={styles.retryButton}
          >
            Try Again
          </LightningButton>
        </BoltCard>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Challenges</Text>
        <Text style={styles.headerSubtitle}>
          Compete, achieve, grow stronger
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {renderTabButton(
          'my',
          'My Challenges',
          challenges.length + myChallenges.length
        )}
        {renderTabButton('public', 'Public', publicChallenges.length)}
        {renderTabButton('suggestions', 'Suggestions')}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'my' && renderMyChallenges()}
        {activeTab === 'public' && renderPublicChallenges()}
        {activeTab === 'suggestions' && renderSuggestions()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
  },
  activeTabButton: {
    backgroundColor: '#A855F7',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  activeTabButtonText: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    marginVertical: 20,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  emptyStateButton: {
    backgroundColor: '#A855F7',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyStateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  suggestionContainer: {
    marginVertical: 8,
  },
  createSuggestionButton: {
    backgroundColor: '#A855F7',
    marginTop: -8,
    marginHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  createSuggestionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#A855F7',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
