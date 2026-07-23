// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

export const getUserProfile = (state) => state.user;

// A user is considered AI-configured only when both a provider and a model are set
export const hasAIConfiguration = ({
  user: { ai_configuration: aiConfiguration },
}) => Boolean(aiConfiguration?.provider && aiConfiguration?.model);
