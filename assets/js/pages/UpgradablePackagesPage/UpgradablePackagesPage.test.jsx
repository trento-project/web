import React from 'react';
import { screen } from '@testing-library/react';

import { faker } from '@faker-js/faker';

import {
  renderWithRouterMatch,
  withState,
  defaultInitialState,
} from '@lib/test-utils';
import { upgradablePackageFactory } from '@lib/test-utils/factories/upgradablePackage';
import { patchForPackageFactory } from '@lib/test-utils/factories/relevantPatches';

import UpgradablePackagesPage from './UpgradablePackagesPage';

describe('UpgradablePackagesPage', () => {
  it('should render correctly', () => {
    const hostID = faker.string.uuid();
    const patch = patchForPackageFactory.build();
    const upgradablePackages = upgradablePackageFactory.buildList(10, {
      patches: [patch],
    });
    const [{ name }] = upgradablePackages;

    const [StatefulPage] = withState(<UpgradablePackagesPage />, {
      ...defaultInitialState,
      softwareUpdates: {
        softwareUpdates: {
          [hostID]: {
            loading: false,
            errors: [],
            upgradable_packages: upgradablePackages,
          },
        },
      },
    });

    renderWithRouterMatch(StatefulPage, {
      path: 'hosts/:hostID/packages',
      route: `/hosts/${hostID}/packages`,
    });

    expect(screen.getAllByText(name, { exact: false })).toHaveLength(2);
  });
});
