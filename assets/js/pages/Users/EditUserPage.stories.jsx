import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router';
import MockAdapter from 'axios-mock-adapter';
import { networkClient } from '@lib/network';
import { userFactory, abilityFactory } from '@lib/test-utils/factories';
import Users from '.';

const mockUser = userFactory.build({ id: 123 });
const mockAbilities = abilityFactory.buildList(4);

export default {
  title: 'Components/EditUserPage',
  component: Users,
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
