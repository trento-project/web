// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { changeSearchParams } from '.';

describe('changeSearchParams', () => {
  it('should set the given params keeping the other ones', () => {
    const current = new URLSearchParams('health=critical&itemsPerPage=50');

    const updated = changeSearchParams({ health: 'passing' })(current);

    expect(updated.toString()).toBe('health=passing&itemsPerPage=50');
  });

  it('should add params which are not present yet', () => {
    const current = new URLSearchParams('health=critical');

    const updated = changeSearchParams({ itemsPerPage: 50 })(current);

    expect(updated.toString()).toBe('health=critical&itemsPerPage=50');
  });

  it('should remove the params set to null or undefined', () => {
    const current = new URLSearchParams(
      'targetType=cluster&clusterType=hana_scale_up&provider=aws'
    );

    const updated = changeSearchParams({
      clusterType: null,
      provider: undefined,
    })(current);

    expect(updated.toString()).toBe('targetType=cluster');
  });

  it('should write an array as a repeated param', () => {
    const current = new URLSearchParams('health=unknown&itemsPerPage=50');

    const updated = changeSearchParams({
      health: ['critical', 'warning'],
    })(current);

    expect(updated.getAll('health')).toEqual(['critical', 'warning']);
    expect(updated.get('itemsPerPage')).toBe('50');
  });

  it('should remove a param set to an empty array', () => {
    const current = new URLSearchParams('health=critical&health=warning');

    const updated = changeSearchParams({ health: [] })(current);

    expect(updated.toString()).toBe('');
  });

  it('should not mutate the current search params', () => {
    const current = new URLSearchParams('health=critical');

    changeSearchParams({ health: 'passing', itemsPerPage: 50 })(current);

    expect(current.toString()).toBe('health=critical');
  });
});
