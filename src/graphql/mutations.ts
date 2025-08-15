/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createUser = /* GraphQL */ `
  mutation CreateUser(
    $input: CreateUserInput!
    $condition: ModelUserConditionInput
  ) {
    createUser(input: $input, condition: $condition) {
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

export const updateUser = /* GraphQL */ `
  mutation UpdateUser(
    $input: UpdateUserInput!
    $condition: ModelUserConditionInput
  ) {
    updateUser(input: $input, condition: $condition) {
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

export const deleteUser = /* GraphQL */ `
  mutation DeleteUser(
    $input: DeleteUserInput!
    $condition: ModelUserConditionInput
  ) {
    deleteUser(input: $input, condition: $condition) {
      id
      email
      username
      displayName
      createdAt
      updatedAt
    }
  }
`;

export const createLocation = /* GraphQL */ `
  mutation CreateLocation(
    $input: CreateLocationInput!
    $condition: ModelLocationConditionInput
  ) {
    createLocation(input: $input, condition: $condition) {
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

export const updateLocation = /* GraphQL */ `
  mutation UpdateLocation(
    $input: UpdateLocationInput!
    $condition: ModelLocationConditionInput
  ) {
    updateLocation(input: $input, condition: $condition) {
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

export const processCheckIn = /* GraphQL */ `
  mutation ProcessCheckIn($input: ProcessCheckInInput!) {
    processCheckIn(input: $input) {
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

export const createCheckIn = /* GraphQL */ `
  mutation CreateCheckIn(
    $input: CreateCheckInInput!
    $condition: ModelCheckInConditionInput
  ) {
    createCheckIn(input: $input, condition: $condition) {
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

export const updateCheckIn = /* GraphQL */ `
  mutation UpdateCheckIn(
    $input: UpdateCheckInInput!
    $condition: ModelCheckInConditionInput
  ) {
    updateCheckIn(input: $input, condition: $condition) {
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
  }
`;

export const deleteCheckIn = /* GraphQL */ `
  mutation DeleteCheckIn(
    $input: DeleteCheckInInput!
    $condition: ModelCheckInConditionInput
  ) {
    deleteCheckIn(input: $input, condition: $condition) {
      id
      userId
      locationId
      createdAt
      updatedAt
    }
  }
`;

export const createDiscovery = /* GraphQL */ `
  mutation CreateDiscovery(
    $input: CreateDiscoveryInput!
    $condition: ModelDiscoveryConditionInput
  ) {
    createDiscovery(input: $input, condition: $condition) {
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

export const updateDiscovery = /* GraphQL */ `
  mutation UpdateDiscovery(
    $input: UpdateDiscoveryInput!
    $condition: ModelDiscoveryConditionInput
  ) {
    updateDiscovery(input: $input, condition: $condition) {
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
  }
`;

export const deleteDiscovery = /* GraphQL */ `
  mutation DeleteDiscovery(
    $input: DeleteDiscoveryInput!
    $condition: ModelDiscoveryConditionInput
  ) {
    deleteDiscovery(input: $input, condition: $condition) {
      id
      userId
      locationId
      title
      description
      createdAt
      updatedAt
    }
  }
`;

export const createBadge = /* GraphQL */ `
  mutation CreateBadge(
    $input: CreateBadgeInput!
    $condition: ModelBadgeConditionInput
  ) {
    createBadge(input: $input, condition: $condition) {
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

export const updateBadge = /* GraphQL */ `
  mutation UpdateBadge(
    $input: UpdateBadgeInput!
    $condition: ModelBadgeConditionInput
  ) {
    updateBadge(input: $input, condition: $condition) {
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

export const createUserBadge = /* GraphQL */ `
  mutation CreateUserBadge(
    $input: CreateUserBadgeInput!
    $condition: ModelUserBadgeConditionInput
  ) {
    createUserBadge(input: $input, condition: $condition) {
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

export const updateStreakProgress = /* GraphQL */ `
  mutation UpdateStreakProgress($input: UpdateStreakInput!) {
    updateStreakProgress(input: $input) {
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

export const createUserStreak = /* GraphQL */ `
  mutation CreateUserStreak(
    $input: CreateUserStreakInput!
    $condition: ModelUserStreakConditionInput
  ) {
    createUserStreak(input: $input, condition: $condition) {
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
  }
`;

export const updateUserStreak = /* GraphQL */ `
  mutation UpdateUserStreak(
    $input: UpdateUserStreakInput!
    $condition: ModelUserStreakConditionInput
  ) {
    updateUserStreak(input: $input, condition: $condition) {
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
  }
`;

export const processReferral = /* GraphQL */ `
  mutation ProcessReferral($input: ProcessReferralInput!) {
    processReferral(input: $input) {
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
        referralCount
        referralXp
      }
      createdAt
      updatedAt
    }
  }
`;

export const createReferral = /* GraphQL */ `
  mutation CreateReferral(
    $input: CreateReferralInput!
    $condition: ModelReferralConditionInput
  ) {
    createReferral(input: $input, condition: $condition) {
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

export const createStreakAchievement = /* GraphQL */ `
  mutation CreateStreakAchievement(
    $input: CreateStreakAchievementInput!
    $condition: ModelStreakAchievementConditionInput
  ) {
    createStreakAchievement(input: $input, condition: $condition) {
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
      }
      createdAt
      updatedAt
    }
  }
`;