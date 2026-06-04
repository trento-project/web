// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { sapSystemApplicationInstanceFactory } from '@lib/test-utils/factories';

import {
  isValidEnsaVersion,
  getEnsaVersionLabel,
  getSapSystemType,
} from './sapSystems';

describe('sap systems', () => {
  it('should check if an ensa version is valid', () => {
    ['ensa1', 'ensa2'].forEach((ensaVersion) => {
      expect(isValidEnsaVersion(ensaVersion)).toBe(true);
    });

    expect(isValidEnsaVersion('other')).toBe(false);
  });

  it('should provide a label for an ensa version', () => {
    [
      { key: 'ensa1', label: 'ENSA1' },
      { key: 'ensa2', label: 'ENSA2' },
      { key: 'no_ensa', label: '-' },
    ].forEach(({ key, label }) => {
      expect(getEnsaVersionLabel(key)).toBe(label);
    });
  });

  it('should get the ABAP SAP system type', () => {
    const instances = [
      sapSystemApplicationInstanceFactory.build({
        features: 'MESSAGESERVER|EMQUE',
      }),
      sapSystemApplicationInstanceFactory.build({ features: 'ABAP|GATEWAY' }),
      sapSystemApplicationInstanceFactory.build({ features: 'ENQREP' }),
    ];
    expect(getSapSystemType(instances)).toBe('ABAP');
  });

  it('should get the JAVA SAP system type', () => {
    const instances = [
      sapSystemApplicationInstanceFactory.build({
        features: 'MESSAGESERVER|EMQUE',
      }),
      sapSystemApplicationInstanceFactory.build({ features: 'J2EE|GATEWAY' }),
      sapSystemApplicationInstanceFactory.build({ features: 'ENQREP' }),
    ];
    expect(getSapSystemType(instances)).toBe('JAVA');
  });

  it('should get the ABAP+JAVA SAP system type', () => {
    const instances = [
      sapSystemApplicationInstanceFactory.build({
        features: 'MESSAGESERVER|EMQUE',
      }),
      sapSystemApplicationInstanceFactory.build({ features: 'J2EE|GATEWAY' }),
      sapSystemApplicationInstanceFactory.build({ features: 'ABAP|GATEWAY' }),
      sapSystemApplicationInstanceFactory.build({ features: 'ENQREP' }),
    ];
    expect(getSapSystemType(instances)).toBe('ABAP+JAVA');
  });
});
