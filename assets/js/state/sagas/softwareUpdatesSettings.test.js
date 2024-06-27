import { faker } from '@faker-js/faker';

import { recordSaga } from '@lib/test-utils';

import { networkClient } from '@lib/network';
import MockAdapter from 'axios-mock-adapter';

import { softwareUpdatesSettingsFactory } from '@lib/test-utils/factories/softwareUpdatesSettings';
import { notify } from '@state/notifications';
import {
  startLoadingSoftwareUpdatesSettings,
  setSoftwareUpdatesSettings,
  setSoftwareUpdatesSettingsErrors,
  setEmptySoftwareUpdatesSettings,
  setEditingSoftwareUpdatesSettings,
  setTestingSoftwareUpdatesConnection,
  setNetworkError,
} from '@state/softwareUpdatesSettings';

import {
  fetchSoftwareUpdatesSettings,
  saveSoftwareUpdatesSettings,
  updateSoftwareUpdatesSettings,
  clearSoftwareUpdatesSettings,
  testSoftwareUpdatesConnection,
} from './softwareUpdatesSettings';

describe('Software Updates Settings saga', () => {
  describe('Fetching Software Updates Settings', () => {
    it('should successfully fetch software updates settings', async () => {
      const axiosMock = new MockAdapter(networkClient);
      const successfulResponse = softwareUpdatesSettingsFactory.build();

      axiosMock
        .onGet('/settings/suma_credentials')
        .reply(200, successfulResponse);

      const dispatched = await recordSaga(fetchSoftwareUpdatesSettings);

      expect(dispatched).toEqual([
        startLoadingSoftwareUpdatesSettings(),
        setSoftwareUpdatesSettings(successfulResponse),
      ]);
    });

    it('should empty software updates settings when no configured settings were found', async () => {
      const axiosMock = new MockAdapter(networkClient);

      axiosMock.onGet('/settings/suma_credentials').reply(404);

      const dispatched = await recordSaga(fetchSoftwareUpdatesSettings);

      expect(dispatched).toEqual([
        startLoadingSoftwareUpdatesSettings(),
        setEmptySoftwareUpdatesSettings(),
      ]);
    });

    it.each([400, 500, 502, 504])(
      'should empty software updates settings and put a network error flag on failed fetching',
      async (status) => {
        const axiosMock = new MockAdapter(networkClient);
        axiosMock.onGet('/settings/suma_credentials').reply(status);

        const dispatched = await recordSaga(fetchSoftwareUpdatesSettings);

        expect(dispatched).toEqual([
          startLoadingSoftwareUpdatesSettings(),
          setEmptySoftwareUpdatesSettings(),
          setNetworkError(true),
        ]);
      }
    );
  });

  describe('Saving Software Updates settings', () => {
    it('should successfully save software updates settings', async () => {
      const axiosMock = new MockAdapter(networkClient);
      const payload = {
        url: faker.internet.url(),
        username: faker.word.noun(),
        password: faker.word.noun(),
        ca_cert: faker.lorem.text(),
      };
      const caUploadedAt = faker.date.recent().toString();
      const successfulResponse = softwareUpdatesSettingsFactory.build({
        url: payload.url,
        username: payload.username,
        ca_uploaded_at: caUploadedAt,
      });

      axiosMock
        .onPost('/settings/suma_credentials')
        .reply(201, successfulResponse);

      const dispatched = await recordSaga(saveSoftwareUpdatesSettings, {
        payload,
      });

      expect(dispatched).toEqual([
        startLoadingSoftwareUpdatesSettings(),
        setSoftwareUpdatesSettings(successfulResponse),
        setEditingSoftwareUpdatesSettings(false),
        setSoftwareUpdatesSettingsErrors([]),
      ]);
    });

    it('should have errors on failed saving', async () => {
      const axiosMock = new MockAdapter(networkClient);
      const payload = {
        url: '',
        username: '',
        password: faker.word.noun(),
        ca_cert: '',
      };
      const errors = [
        {
          detail: "can't be blank",
          source: { pointer: '/url' },
          title: 'Invalid value',
        },
        {
          detail: "can't be blank",
          source: { pointer: '/ca_cert' },
          title: 'Invalid value',
        },
      ];

      axiosMock.onPost('/settings/suma_credentials', payload).reply(422, {
        errors,
      });

      const dispatched = await recordSaga(saveSoftwareUpdatesSettings, {
        payload,
      });

      expect(dispatched).toEqual([
        startLoadingSoftwareUpdatesSettings(),
        setSoftwareUpdatesSettingsErrors(errors),
      ]);
    });
  });

  describe('Updating Software Updates settings', () => {
    it('should successfully change software updates settings', async () => {
      const axiosMock = new MockAdapter(networkClient);
      const payload = {
        url: faker.internet.url(),
        username: faker.word.noun(),
        password: faker.word.noun(),
        ca_cert: faker.lorem.text(),
      };
      const caUploadedAt = faker.date.recent().toString();
      const successfulResponse = softwareUpdatesSettingsFactory.build({
        url: payload.url,
        username: payload.username,
        ca_uploaded_at: caUploadedAt,
      });

      axiosMock
        .onPatch('/settings/suma_credentials')
        .reply(200, successfulResponse);

      const dispatched = await recordSaga(
        updateSoftwareUpdatesSettings,
        payload
      );

      expect(dispatched).toEqual([
        startLoadingSoftwareUpdatesSettings(),
        setSoftwareUpdatesSettings(successfulResponse),
        setEditingSoftwareUpdatesSettings(false),
        setSoftwareUpdatesSettingsErrors([]),
      ]);
    });

    it('should have errors on failed update', async () => {
      const axiosMock = new MockAdapter(networkClient);
      const payload = {
        url: '',
        username: '',
        password: faker.word.noun(),
        ca_cert: '',
      };
      const errors = [
        {
          detail: "can't be blank",
          source: { pointer: '/url' },
          title: 'Invalid value',
        },
        {
          detail: "can't be blank",
          source: { pointer: '/username' },
          title: 'Invalid value',
        },
        {
          detail: "can't be blank",
          source: { pointer: '/ca_cert' },
          title: 'Invalid value',
        },
      ];

      axiosMock.onPatch('/settings/suma_credentials', payload).reply(422, {
        errors,
      });

      const dispatched = await recordSaga(updateSoftwareUpdatesSettings, {
        payload,
      });

      expect(dispatched).toEqual([
        startLoadingSoftwareUpdatesSettings(),
        setSoftwareUpdatesSettingsErrors(errors),
      ]);
    });
  });

  describe('Clearing Software Updates settings', () => {
    it('should successfully clear software updates settings', async () => {
      const axiosMock = new MockAdapter(networkClient);

      axiosMock.onDelete('/settings/suma_credentials').reply(204);

      const dispatched = await recordSaga(clearSoftwareUpdatesSettings);

      expect(dispatched).toEqual([
        startLoadingSoftwareUpdatesSettings(),
        setEmptySoftwareUpdatesSettings(),
      ]);
    });

    it('should have errors on failed clearing', async () => {
      const axiosMock = new MockAdapter(networkClient);

      const errors = [
        { detail: 'Something went wrong.', title: 'Internal Server Error' },
      ];

      axiosMock.onDelete('/settings/suma_credentials').reply(500, {
        errors,
      });

      const dispatched = await recordSaga(clearSoftwareUpdatesSettings);

      expect(dispatched).toEqual([
        startLoadingSoftwareUpdatesSettings(),
        notify({ text: `Unable to clear settings`, icon: '❌' }),
      ]);
    });
  });

  describe('Testing connection with Software Updates provider', () => {
    it('should notify on successful connection test', async () => {
      const axiosMock = new MockAdapter(networkClient);

      axiosMock.onPost('/settings/suma_credentials/test').reply(200);

      const dispatched = await recordSaga(testSoftwareUpdatesConnection);

      expect(dispatched).toEqual([
        setTestingSoftwareUpdatesConnection(true),
        notify({ text: `Connection succeeded!`, icon: '✅' }),
        setTestingSoftwareUpdatesConnection(false),
      ]);
    });

    it.each([400, 404, 422, 500])(
      'should notify on failed connection test',
      async (errorStatus) => {
        const axiosMock = new MockAdapter(networkClient);

        axiosMock.onPost('/settings/suma_credentials/test').reply(errorStatus);

        const dispatched = await recordSaga(testSoftwareUpdatesConnection);

        expect(dispatched).toEqual([
          setTestingSoftwareUpdatesConnection(true),
          notify({ text: `Connection failed!`, icon: '❌' }),
          setTestingSoftwareUpdatesConnection(false),
        ]);
      }
    );
  });
});
