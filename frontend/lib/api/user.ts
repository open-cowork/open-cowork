/**
 * User API
 */

import type { UserProfile, UserCredits } from "../api-types";

// Default user data for development
const DEFAULT_USER_PROFILE: UserProfile = {
  id: "default-user",
  email: "user@opencowork.com",
  avatar: "",
  plan: "free",
  planName: "免费",
};

const DEFAULT_USER_CREDITS: UserCredits = {
  total: "无限",
  free: "无限",
  dailyRefreshCurrent: 9999,
  dailyRefreshMax: 9999,
  refreshTime: "08:00",
};

export const userApi = {
  getProfile: async (): Promise<UserProfile> => {
    // TODO: Replace with real API call
    return DEFAULT_USER_PROFILE;
  },

  getCredits: async (): Promise<UserCredits> => {
    // TODO: Replace with real API call
    return DEFAULT_USER_CREDITS;
  },
};
