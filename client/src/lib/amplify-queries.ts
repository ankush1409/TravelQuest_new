import { graphqlClient } from './amplify-client';
import { 
  getUser, 
  getUserStats, 
  getStreakMapData, 
  getNearbyLocations, 
  searchPlaces,
  listCheckIns,
  listDiscoveries,
  listBadges,
  listUserBadges,
  listStreakRegions,
  listUserStreaks,
  listReferrals
} from '../../../src/graphql/queries';

import {
  createUser,
  updateUser,
  processCheckIn,
  createCheckIn,
  createDiscovery,
  updateDiscovery,
  processReferral,
  createReferral,
  updateStreakProgress,
  createUserStreak,
  createStreakAchievement
} from '../../../src/graphql/mutations';

// Query functions
export const amplifyQueries = {
  // User queries
  async getUser(id: string) {
    const result = await graphqlClient.graphql({
      query: getUser,
      variables: { id }
    });
    return result.data.getUser;
  },

  async getUserStats(userId: string) {
    const result = await graphqlClient.graphql({
      query: getUserStats,
      variables: { userId }
    });
    return result.data.getUserStats;
  },

  // Streak map queries
  async getStreakMapData(userId: string) {
    const result = await graphqlClient.graphql({
      query: getStreakMapData,
      variables: { userId }
    });
    return result.data.getStreakMapData;
  },

  // Location queries
  async getNearbyLocations(latitude: number, longitude: number, radius?: number) {
    const result = await graphqlClient.graphql({
      query: getNearbyLocations,
      variables: { latitude, longitude, radius }
    });
    return result.data.getNearbyLocations;
  },

  async searchPlaces(searchQuery: string, latitude?: number, longitude?: number) {
    const result = await graphqlClient.graphql({
      query: searchPlaces,
      variables: { query: searchQuery, latitude, longitude }
    });
    return result.data.searchPlaces;
  },

  // Check-ins and discoveries
  async listCheckIns(filter?: any, limit?: number) {
    const result = await graphqlClient.graphql({
      query: listCheckIns,
      variables: { filter, limit }
    });
    return result.data.listCheckIns;
  },

  async listDiscoveries(filter?: any, limit?: number) {
    const result = await graphqlClient.graphql({
      query: listDiscoveries,
      variables: { filter, limit }
    });
    return result.data.listDiscoveries;
  },

  // Badges
  async listBadges(filter?: any) {
    const result = await graphqlClient.graphql({
      query: listBadges,
      variables: { filter }
    });
    return result.data.listBadges;
  },

  async listUserBadges(filter?: any) {
    const result = await graphqlClient.graphql({
      query: listUserBadges,
      variables: { filter }
    });
    return result.data.listUserBadges;
  },

  // Streaks
  async listStreakRegions(filter?: any) {
    const result = await graphqlClient.graphql({
      query: listStreakRegions,
      variables: { filter }
    });
    return result.data.listStreakRegions;
  },

  async listUserStreaks(filter?: any) {
    const result = await graphqlClient.graphql({
      query: listUserStreaks,
      variables: { filter }
    });
    return result.data.listUserStreaks;
  },

  // Referrals
  async listReferrals(filter?: any) {
    const result = await graphqlClient.graphql({
      query: listReferrals,
      variables: { filter }
    });
    return result.data.listReferrals;
  }
};

// Mutation functions
export const amplifyMutations = {
  // User mutations
  async createUser(input: any) {
    const result = await graphqlClient.graphql({
      query: createUser,
      variables: { input }
    });
    return result.data.createUser;
  },

  async updateUser(input: any) {
    const result = await graphqlClient.graphql({
      query: updateUser,
      variables: { input }
    });
    return result.data.updateUser;
  },

  // Check-in mutations
  async processCheckIn(input: any) {
    const result = await graphqlClient.graphql({
      query: processCheckIn,
      variables: { input }
    });
    return result.data.processCheckIn;
  },

  async createCheckIn(input: any) {
    const result = await graphqlClient.graphql({
      query: createCheckIn,
      variables: { input }
    });
    return result.data.createCheckIn;
  },

  // Discovery mutations
  async createDiscovery(input: any) {
    const result = await graphqlClient.graphql({
      query: createDiscovery,
      variables: { input }
    });
    return result.data.createDiscovery;
  },

  async updateDiscovery(input: any) {
    const result = await graphqlClient.graphql({
      query: updateDiscovery,
      variables: { input }
    });
    return result.data.updateDiscovery;
  },

  // Referral mutations
  async processReferral(input: any) {
    const result = await graphqlClient.graphql({
      query: processReferral,
      variables: { input }
    });
    return result.data.processReferral;
  },

  async createReferral(input: any) {
    const result = await graphqlClient.graphql({
      query: createReferral,
      variables: { input }
    });
    return result.data.createReferral;
  },

  // Streak mutations
  async updateStreakProgress(input: any) {
    const result = await graphqlClient.graphql({
      query: updateStreakProgress,
      variables: { input }
    });
    return result.data.updateStreakProgress;
  },

  async createUserStreak(input: any) {
    const result = await graphqlClient.graphql({
      query: createUserStreak,
      variables: { input }
    });
    return result.data.createUserStreak;
  },

  async createStreakAchievement(input: any) {
    const result = await graphqlClient.graphql({
      query: createStreakAchievement,
      variables: { input }
    });
    return result.data.createStreakAchievement;
  }
};