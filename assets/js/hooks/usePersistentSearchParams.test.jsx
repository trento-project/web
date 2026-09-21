// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { Link, MemoryRouter } from 'react-router';
import { act, renderHook, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { readViewSetting, writeViewSetting } from '@lib/viewSettings';

import usePersistentSearchParams from './usePersistentSearchParams';

const renderPersistentSearchParams = ({ route = '/hosts', ...options } = {}) =>
  renderHook(() => usePersistentSearchParams('hosts', options), {
    wrapper: function Wrapper({ children }) {
      return <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>;
    },
  });

// The hook is rendered outside the routes, so that the navigation the sidebar
// entry triggers does not remount it, the way react router keeps a view mounted
// when it is entered again from the view itself
const renderPersistentSearchParamsWithSidebarEntry = ({
  route = '/hosts',
  ...options
} = {}) =>
  renderHook(() => usePersistentSearchParams('hosts', options), {
    wrapper: function Wrapper({ children }) {
      return (
        <MemoryRouter initialEntries={[route]}>
          <Link to="/hosts">Hosts</Link>
          {children}
        </MemoryRouter>
      );
    },
  });

const currentSearch = ({ result }) => result.current[0].toString();

describe('usePersistentSearchParams', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('should leave a bare url untouched when the view has no stored settings', async () => {
    const view = renderPersistentSearchParams();

    await waitFor(() => expect(currentSearch(view)).toBe(''));
  });

  it('should restore the stored settings when the url is bare', async () => {
    writeViewSetting('hosts', 'health=critical&itemsPerPage=50');

    const view = renderPersistentSearchParams();

    await waitFor(() =>
      expect(currentSearch(view)).toBe('health=critical&itemsPerPage=50')
    );
    // restoring must not overwrite the stored settings with the bare params
    // the view was first rendered with
    expect(readViewSetting('hosts')).toBe('health=critical&itemsPerPage=50');
  });

  it('should let the url win over the stored settings', async () => {
    writeViewSetting('hosts', 'health=critical');

    const view = renderPersistentSearchParams({
      route: '/hosts?health=passing',
    });

    await waitFor(() => expect(currentSearch(view)).toBe('health=passing'));
    await waitFor(() =>
      expect(readViewSetting('hosts')).toBe('health=passing')
    );
  });

  it('should store the settings whenever the search params change', async () => {
    const { result } = renderPersistentSearchParams();

    act(() => result.current[1]('health=critical'));

    await waitFor(() =>
      expect(readViewSetting('hosts')).toBe('health=critical')
    );
  });

  it('should not store the transient params', async () => {
    const { result } = renderPersistentSearchParams({
      transientKeys: ['after', 'search'],
    });

    act(() => result.current[1]('health=critical&after=cursor&search=foo'));

    await waitFor(() =>
      expect(readViewSetting('hosts')).toBe('health=critical')
    );
  });

  it('should keep the filters cleared once the user cleared them', async () => {
    writeViewSetting('hosts', '');

    const view = renderPersistentSearchParams({
      defaultParams: { health: 'critical' },
    });

    await waitFor(() => expect(currentSearch(view)).toBe(''));
  });

  it('should restore the stored settings when the view is entered again without being remounted', async () => {
    const user = userEvent.setup();

    const view = renderPersistentSearchParamsWithSidebarEntry({
      route: '/hosts?health=passing',
    });

    await waitFor(() =>
      expect(readViewSetting('hosts')).toBe('health=passing')
    );

    await user.click(screen.getByText('Hosts'));

    await waitFor(() => expect(currentSearch(view)).toBe('health=passing'));
    expect(readViewSetting('hosts')).toBe('health=passing');
  });

  it('should apply the default params when the view was never visited', async () => {
    const view = renderPersistentSearchParams({
      defaultParams: { health: 'critical' },
    });

    await waitFor(() => expect(currentSearch(view)).toBe('health=critical'));
  });
});
