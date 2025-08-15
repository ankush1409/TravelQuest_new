/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getUser = /* GraphQL */ `
  query GetUser($id: ID!) {
    getUser(id: $id) {
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
      googleId
      provider
      localGuidesUrl
      localGuidesLevel
      localGuidesPoints
      localGuidesReviews
      localGuidesPhotos
      localGuidesVideos
      localGuidesEdits
      localGuidesQuestions
      localGuidesFacts
      localGuidesRoads
      localGuidesLists
      localGuidesLastUpdate
      referralCode
      referredBy
      referralCount
      referralXp
      onboardingCompleted
      preferredTheme
      notificationsEnabled
      privacyMode
      accessibilityMode
      dashboardLayout
      createdAt
      updatedAt
    }
  }
`;

export const listUsers = /* GraphQL */ `
  query ListUsers(
    $filter: ModelUserFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listUsers(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
        googleId
        provider
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

export const getUserStats = /* GraphQL */ `
  query GetUserStats($userId: ID!) {
    getUserStats(userId: $userId) {
      totalXP
      level
      checkInCount
      discoveryCount
      badgeCount
      streakCount
      referralCount
    }
  }
`;

export const getStreakMapData = /* GraphQL */ `
  query GetStreakMapData($userId: ID!) {
    getStreakMapData(userId: $userId) {
      regions {
        id
        name
        countryCode
        regionType
        coordinates
        parentRegionId
        isActive
        createdAt
        updatedAt
      }
      userStreaks {
        id
        userId
        regionId
        streakType
        count
        maxStreak
        lastActivity
        metadata
        createdAt
        updatedAt
      }
      achievements {
        id
        userId
        name
        description
        xpReward
        unlockedAt
        metadata
        createdAt
        updatedAt
      }
    }
  }
`;

export const getNearbyLocations = /* GraphQL */ `
  query GetNearbyLocations($latitude: Float!, $longitude: Float!, $radius: Int) {
    getNearbyLocations(latitude: $latitude, longitude: $longitude, radius: $radius) {
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

export const searchPlaces = /* GraphQL */ `
  query SearchPlaces($query: String!, $latitude: Float, $longitude: Float) {
    searchPlaces(query: $query, latitude: $latitude, longitude: $longitude) {
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

export const getLocation = /* GraphQL */ `
  query GetLocation($id: ID!) {
    getLocation(id: $id) {
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
      checkIns {
        items {
          id
          userId
          locationId
          xpEarned
          notes
          photoUrl
          verificationDistance
          createdAt
          updatedAt
        }
        nextToken
      }
      discoveries {
        items {
          id
          userId
          locationId
          title
          description
          photoUrl
          xpEarned
          createdAt
          updatedAt
        }
        nextToken
      }
      createdAt
      updatedAt
    }
  }
`;

export const listCheckIns = /* GraphQL */ `
  query ListCheckIns(
    $filter: ModelCheckInFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listCheckIns(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
          profilePicture
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
      nextToken
    }
  }
`;

export const listDiscoveries = /* GraphQL */ `
  query ListDiscoveries(
    $filter: ModelDiscoveryFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listDiscoveries(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
          profilePicture
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
      nextToken
    }
  }
`;

export const listBadges = /* GraphQL */ `
  query ListBadges(
    $filter: ModelBadgeFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listBadges(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
    }
  }
`;

export const listUserBadges = /* GraphQL */ `
  query ListUserBadges(
    $filter: ModelUserBadgeFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listUserBadges(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
    }
  }
`;

export const listStreakRegions = /* GraphQL */ `
  query ListStreakRegions(
    $filter: ModelStreakRegionFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listStreakRegions(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        countryCode
        regionType
        coordinates
        parentRegionId
        isActive
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

export const listUserStreaks = /* GraphQL */ `
  query ListUserStreaks(
    $filter: ModelUserStreakFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listUserStreaks(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
    }
  }
`;

export const listReferrals = /* GraphQL */ `
  query ListReferrals(
    $filter: ModelReferralFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listReferrals(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
    }
  }
`;