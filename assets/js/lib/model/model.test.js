// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { isValidProvider } from '.';

describe('model', () => {
  it('should check if a provider is valid', () => {
    ['azure', 'aws', 'gcp', 'nutanix', 'kvm', 'vmware'].forEach((provider) => {
      expect(isValidProvider(provider)).toBe(true);
    });

    expect(isValidProvider('other')).toBe(false);
  });
});
