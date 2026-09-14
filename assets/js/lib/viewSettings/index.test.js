// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { faker } from '@faker-js/faker';

import {
  initViewSettings,
  readViewSetting,
  writeViewSetting,
  clearViewSettings,
} from '.';

describe('view settings', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    jest.restoreAllMocks();
  });

  it('should return null for a view which was never visited', () => {
    expect(readViewSetting('hosts')).toBeNull();
  });

  it('should store and read back the settings of a view', () => {
    writeViewSetting('hosts', 'health=critical&itemsPerPage=50');

    expect(readViewSetting('hosts')).toBe('health=critical&itemsPerPage=50');
  });

  it('should keep the settings of the different views apart', () => {
    writeViewSetting('hosts', 'health=critical');
    writeViewSetting('clusters', 'health=passing');

    expect(readViewSetting('hosts')).toBe('health=critical');
    expect(readViewSetting('clusters')).toBe('health=passing');
  });

  it('should tell apart a view with cleared filters from a never visited one', () => {
    writeViewSetting('hosts', '');

    expect(readViewSetting('hosts')).toBe('');
    expect(readViewSetting('clusters')).toBeNull();
  });

  it('should discard the settings of the previous user on initialization', () => {
    initViewSettings(faker.string.uuid());
    writeViewSetting('hosts', 'health=critical');

    initViewSettings(faker.string.uuid());

    expect(readViewSetting('hosts')).toBeNull();
  });

  it('should keep the settings of the same user on initialization', () => {
    const userID = faker.string.uuid();

    initViewSettings(userID);
    writeViewSetting('hosts', 'health=critical');

    initViewSettings(userID);

    expect(readViewSetting('hosts')).toBe('health=critical');
  });

  it('should discard the settings stored before any user was known', () => {
    writeViewSetting('hosts', 'health=critical');

    initViewSettings(faker.string.uuid());

    expect(readViewSetting('hosts')).toBeNull();
  });

  it('should forget every setting once cleared', () => {
    initViewSettings(faker.string.uuid());
    writeViewSetting('hosts', 'health=critical');

    clearViewSettings();

    expect(readViewSetting('hosts')).toBeNull();
  });

  it('should degrade to no persistence when the session storage is not available', () => {
    jest
      .spyOn(window.sessionStorage.__proto__, 'getItem')
      .mockImplementation(() => {
        throw new Error('storage is disabled');
      });
    jest
      .spyOn(window.sessionStorage.__proto__, 'setItem')
      .mockImplementation(() => {
        throw new Error('storage is disabled');
      });

    expect(() => initViewSettings(faker.string.uuid())).not.toThrow();
    expect(() => writeViewSetting('hosts', 'health=critical')).not.toThrow();
    expect(readViewSetting('hosts')).toBeNull();
  });

  it('should ignore corrupted stored settings', () => {
    window.sessionStorage.setItem('trento_view_settings', 'not json');

    expect(readViewSetting('hosts')).toBeNull();
  });
});
