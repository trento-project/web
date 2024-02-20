import { faker } from '@faker-js/faker';

import { recordSaga } from '@lib/test-utils';

import { networkClient } from '@lib/network';
import MockAdapter from 'axios-mock-adapter';

import { softwareUpdatesSettingsFactory } from '@lib/test-utils/factories/softwareUpdatesSettings';
import {
  startLoadingSoftwareUpdatesSettings,
  setSoftwareUpdatesSettings,
  setSoftwareUpdatesSettingsErrors,
  setEmptySoftwareUpdatesSettings,
} from '@state/softwareUpdatesSettings';

import {
  fetchSoftwareUpdatesSettings,
  saveSoftwareUpdatesSettings,
  updateSoftwareUpdatesSettings,
  clearSoftwareUpdatesSettings,
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

    it('should empty software updates settings on failed fetching', async () => {
      const axiosMock = new MockAdapter(networkClient);
      [404, 500].forEach(async (errorStatus) => {
        axiosMock.onGet('/settings/suma_credentials').reply(errorStatus);

        const dispatched = await recordSaga(fetchSoftwareUpdatesSettings);

        expect(dispatched).toEqual([
          startLoadingSoftwareUpdatesSettings(),
          setEmptySoftwareUpdatesSettings(),
        ]);
      });
    });
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

      const dispatched = await recordSaga(saveSoftwareUpdatesSettings, payload);

      expect(dispatched).toEqual([
        startLoadingSoftwareUpdatesSettings(),
        setSoftwareUpdatesSettings(successfulResponse),
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

      const dispatched = await recordSaga(saveSoftwareUpdatesSettings, payload);

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

      const dispatched = await recordSaga(
        updateSoftwareUpdatesSettings,
        payload
      );

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
        setSoftwareUpdatesSettingsErrors(errors),
      ]);
    });
  });
});
