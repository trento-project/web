import MockAdapter from 'axios-mock-adapter';
import { catalogCheckFactory } from '@lib/test-utils/factories';
import { recordSaga } from '@lib/test-utils';

import { networkClient } from '@lib/network';
import { updateCatalog } from './catalog';

import { setCatalogLoading, setCatalogData, setCatalogError } from '../catalog';

const getCatalogUrl = '/api/v3/checks/catalog';
const axiosMock = new MockAdapter(networkClient);

describe('Catalog saga', () => {
  beforeEach(() => {
    axiosMock.reset();
    jest.spyOn(console, 'error').mockImplementation(() => null);
  });

  afterEach(() => {
    /* eslint-disable-next-line */
    console.error.mockRestore();
  });

  it('should update catalog', async () => {
    const catalog = catalogCheckFactory.buildList(5);

    axiosMock.onGet(getCatalogUrl).reply(200, {
      items: catalog,
    });

    const dispatched = await recordSaga(updateCatalog, {});

    expect(dispatched).toContainEqual(setCatalogLoading());
    expect(dispatched).toContainEqual(setCatalogData({ data: catalog }));
  });

  it('should update catalog with error', async () => {
    axiosMock.onGet(getCatalogUrl).networkError();

    const dispatched = await recordSaga(updateCatalog, {});

    expect(dispatched).toContainEqual(setCatalogLoading());
    expect(dispatched).toContainEqual(
      setCatalogError({ error: 'Network Error' })
    );
  });

  it('should update catalog when adding a payload to retrieve it', async () => {
    const catalog = catalogCheckFactory.buildList(5);
    const payload = { some: 'payload' };

    axiosMock.onGet(getCatalogUrl).reply(200, {
      items: catalog,
    });

    const dispatched = await recordSaga(updateCatalog, { payload });

    expect(axiosMock.history.get[0].params).toEqual(payload);
    expect(dispatched).toContainEqual(setCatalogLoading());
    expect(dispatched).toContainEqual(setCatalogData({ data: catalog }));
  });
});
