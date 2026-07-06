// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

export const getUserProfile = (state) => state.user;

export const getAIConfiguration = (state) => state.user.ai_configuration;

// A user is considered AI-configured only when both a provider and a model
// are set (mirrors the `hasAIConfiguration` check in common/AIConfiguration).
export const hasAIConfiguration = (state) => {
  const aiConfiguration = getAIConfiguration(state) || {};
  return Boolean(aiConfiguration.provider && aiConfiguration.model);
};
