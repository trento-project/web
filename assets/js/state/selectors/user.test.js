// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import {
  userFactory,
  aiConfigurationFactory,
} from '@lib/test-utils/factories/users';

import { getUserProfile, hasAIConfiguration } from './user';

describe('user selectors', () => {
  describe('getUserProfile', () => {
    it('should return the user slice', () => {
      const user = userFactory.build();

      expect(getUserProfile({ user })).toEqual(user);
    });
  });

  describe('hasAIConfiguration', () => {
    it('should return true when both provider and model are set', () => {
      const ai_configuration = aiConfigurationFactory.build();

      expect(hasAIConfiguration({ user: { ai_configuration } })).toBe(true);
    });

    it.each([
      { name: 'provider is missing', ai_configuration: { model: 'gpt-4' } },
      { name: 'model is missing', ai_configuration: { provider: 'openai' } },
      {
        name: 'provider is empty',
        ai_configuration: { provider: '', model: 'gpt-4' },
      },
      {
        name: 'model is empty',
        ai_configuration: { provider: 'openai', model: '' },
      },
      { name: 'configuration is an empty object', ai_configuration: {} },
      { name: 'configuration is null', ai_configuration: null },
      { name: 'configuration is undefined', ai_configuration: undefined },
    ])('should return false when $name', ({ ai_configuration }) => {
      expect(hasAIConfiguration({ user: { ai_configuration } })).toBe(false);
    });
  });
});
