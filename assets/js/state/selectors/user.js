// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

export const getUserProfile = (state) => state.user;

// A user is considered AI-configured only when both a provider and a model are set
export const hasAIConfiguration = (state) => {
  const aiConfiguration = state?.user?.ai_configuration;
  return Boolean(aiConfiguration?.provider && aiConfiguration?.model);
};
