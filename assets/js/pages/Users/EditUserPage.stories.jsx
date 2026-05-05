import { networkClient } from '@lib/network';
import { abilityFactory, userFactory } from '@lib/test-utils/factories';
import MockAdapter from 'axios-mock-adapter';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router';

import EditUserPage from './EditUserPage';

const mockUser = userFactory.build({ id: 123 });
const mockAbilities = abilityFactory.buildList(4);

export default {
  title: 'Components/EditUserPage',
  component: EditUserPage,
  decorators: [
    (Story) => {
      const axiosMock = new MockAdapter(networkClient);
      axiosMock.onGet(`/api/v1/users/${mockUser.id}`).reply(200, mockUser);
      axiosMock.onGet('/abilities').reply(200, mockAbilities);
      axiosMock.onPut(`/api/v1/users/${mockUser.id}`).reply(200, mockUser);

      return (
        <MemoryRouter initialEntries={[`/users/${mockUser.id}/edit`]}>
          <Routes>
            <Route path="/users/:userID/edit" element={<Story />} />
          </Routes>
        </MemoryRouter>
      );
    },
  ],
  argTypes: {},
};

export const Default = {
  args: {},
};
