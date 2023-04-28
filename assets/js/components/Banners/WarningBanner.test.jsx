import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import WarningBanner, {
  getProviderWarningBanner,
  getResultProviderWarningBanner,
} from './WarningBanner';

describe('WarningBanner', () => {
  it('should display a warning banner with its text and icon', () => {
    render(
      <WarningBanner>
        Warning!
        <br />
        You should have a look on this!
      </WarningBanner>
    );

    expect(screen.getByTestId('warning-banner')).toHaveTextContent(
      'Warning!You should have a look on this!'
    );
  });

  describe('Banner retrieving', () => {
    it('should retrieve the default banner', () => {
      const unknownProviderBanner = getProviderWarningBanner('unknown');
      const vmwareProviderBanner = getProviderWarningBanner('vmware');

      expect(unknownProviderBanner).toBeTruthy();
      expect(vmwareProviderBanner).toBeTruthy();
    });

    it('should retrieve the result specific banner', () => {
      const unknownProviderBannerForResults =
        getResultProviderWarningBanner('unknown');

      expect(unknownProviderBannerForResults).toBeTruthy();
    });

    it('should fallback to the default banner when a result specific one is not available', () => {
      const vmwareProviderBanner = getResultProviderWarningBanner('vmware');

      expect(vmwareProviderBanner).toBeTruthy();
    });

    it('should not retrieve a banner for a not defined provider option', () => {
      const notABanner = getProviderWarningBanner('not-a-provider');
      const notAResultBanner = getResultProviderWarningBanner('not-a-provider');

      expect(notABanner).toBeFalsy();
      expect(notAResultBanner).toBeFalsy();
    });
  });
});
