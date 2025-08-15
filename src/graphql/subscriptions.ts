/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCheckInCreated = /* GraphQL */ `
  subscription OnCheckInCreated($userId: ID!) {
    onCheckInCreated(userId: $userId) {
      id
      userId
      locationId
      xpEarned
      notes
      photoUrl
      verificationDistance
      user {
        id
        username
        displayName
        totalXP
        level
      }
      location {
        id
        name
        description
        latitude
        longitude
        address
        category
        rating
        photoUrl
      }
      createdAt
      updatedAt
    }
  }
`;

export const onStreakUpdated = /* GraphQL */ `
  subscription OnStreakUpdated($userId: ID!) {
    onStreakUpdated(userId: $userId) {
      id
      userId
      regionId
      streakType
      count
      maxStreak
      lastActivity
      metadata
      user {
        id
        username
        displayName
        totalXP
        level
      }
      region {
        id
        name
        countryCode
        regionType
      }
      createdAt
      updatedAt
    }
  }
`;

export const onAchievementUnlocked = /* GraphQL */ `
  subscription OnAchievementUnlocked($userId: ID!) {
    onAchievementUnlocked(userId: $userId) {
      id
      userId
      name
      description
      xpReward
      unlockedAt
      metadata
      user {
        id
        username
        displayName
        totalXP
        level
      }
      createdAt
      updatedAt
    }
  }
`;

export const onUserCreated = /* GraphQL */ `
  subscription OnUserCreated {
    onUserCreated {
      id
      email
      username
      displayName
      bio
      profilePicture
      travelStyle
      totalXP
      level
      isPrivate
      createdAt
      updatedAt
    }
  }
`;

export const onUserUpdated = /* GraphQL */ `
  subscription OnUserUpdated {
    onUserUpdated {
      id
      email
      username
      displayName
      bio
      profilePicture
      travelStyle
      totalXP
      level
      isPrivate
      createdAt
      updatedAt
    }
  }
`;

export const onLocationCreated = /* GraphQL */ `
  subscription OnLocationCreated {
    onLocationCreated {
      id
      name
      description
      latitude
      longitude
      address
      category
      googlePlaceId
      rating
      photoUrl
      isActive
      xpReward
      createdAt
      updatedAt
    }
  }
`;

export const onDiscoveryCreated = /* GraphQL */ `
  subscription OnDiscoveryCreated($userId: ID!) {
    onDiscoveryCreated(userId: $userId) {
      id
      userId
      locationId
      title
      description
      photoUrl
      xpEarned
      user {
        id
        username
        displayName
      }
      location {
        id
        name
        description
        latitude
        longitude
        address
        category
        rating
        photoUrl
      }
      createdAt
      updatedAt
    }
  }
`;

export const onBadgeCreated = /* GraphQL */ `
  subscription OnBadgeCreated {
    onBadgeCreated {
      id
      name
      description
      icon
      category
      xpRequirement
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const onUserBadgeCreated = /* GraphQL */ `
  subscription OnUserBadgeCreated($userId: ID!) {
    onUserBadgeCreated(userId: $userId) {
      id
      userId
      badgeId
      earnedAt
      user {
        id
        username
        displayName
      }
      badge {
        id
        name
        description
        icon
        category
        xpRequirement
      }
      createdAt
      updatedAt
    }
  }
`;

export const onReferralCreated = /* GraphQL */ `
  subscription OnReferralCreated($userId: ID!) {
    onReferralCreated(userId: $userId) {
      id
      referrerId
      referredUserId
      xpAwarded
      status
      completedAt
      referrer {
        id
        username
        displayName
      }
      createdAt
      updatedAt
    }
  }
`;