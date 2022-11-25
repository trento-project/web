import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { catalogCheckFactory } from '@lib/test-utils/factories';
import { recordSaga } from '@lib/test-utils';

import { updateCatalog } from './catalog';

import {
  setCatalogLoading,
  setCatalogData,
  setCatalogError,
} from '../catalogNew';

const wandaURL = process.env.WANDA_URL;
const url = `${wandaURL}/api/checks/catalog`;
const axiosMock = new MockAdapter(axios);

describe('Catalog saga', () => {
  beforeEach(() => {
    axiosMock.reset();
    jest.spyOn(console, 'error').mockImplementation(() => null);
  });

  afterEach(() => {
    /* eslint-disable no-console */
    console.error.mockRestore();
  });

  it('should update catalog', async () => {
    const catalog = catalogCheckFactory.buildList(5);

    axiosMock.onGet(url).reply(200, {
      items: catalog,
    });

    const dispatched = await recordSaga(updateCatalog, {});

    expect(dispatched).toContainEqual(setCatalogLoading());
    expect(dispatched).toContainEqual(setCatalogData({ data: catalog }));
  });

  it('should update catalog with error', async () => {
    axiosMock.onGet(url).networkError();

    const dispatched = await recordSaga(updateCatalog, {});

    expect(dispatched).toContainEqual(setCatalogLoading());
    expect(dispatched).toContainEqual(
      setCatalogError({ error: 'Network Error' })
    );
  });
});
