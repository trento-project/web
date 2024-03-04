import React from 'react';

import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import {
  ascsErsClusterNodeFactory,
  hanaClusterDetailsNodesFactory,
} from '@lib/test-utils/factories';

import AttributesDetails from './AttributesDetails';

describe('AttributesDetails', () => {
  const modalTitle = 'Node Details';
  const expectedResourceTableHeaders = [
    {
      title: 'fail count',
      key: 'fail_count',
    },
    {
      title: 'id',
      key: 'id',
    },
    {
      title: 'role',
      key: 'role',
    },
    {
      title: 'status',
      key: 'status',
    },
    {
      title: 'managed',
      key: 'managed',
    },
    {
      title: 'type',
      key: 'type',
    },
  ];
  const [
    {
      attributes: ascsErsClusterAttributes,
      resources: ascsErsClusterResources,
    },
  ] = ascsErsClusterNodeFactory.buildList(1);
  const [
    { attributes: hanaClusterAttributes, resources: hanaClusterResources },
  ] = hanaClusterDetailsNodesFactory.buildList(1);

  const scenarios = [
    {
      description:
        'should render modal with empty attributes and empty resources',
      attributes: {},
      resources: [],
      pageTitle: modalTitle,
    },
    {
      description:
        'should render modal with empty attributes and ascsErsCluster node resources',
      attributes: {},
      resources: ascsErsClusterResources,
      pageTitle: modalTitle,
    },
    {
      description:
        'should render modal with ascsErsCluster node attributes and empty resources',
      attributes: ascsErsClusterAttributes,
      resources: [],
      pageTitle: modalTitle,
    },
    {
      description:
        'should render modal with ascsErsCluster node attributes and resources',
      attributes: ascsErsClusterAttributes,
      resources: ascsErsClusterResources,
      pageTitle: modalTitle,
    },
    {
      description:
        'should render modal with empty attributes and hanaCluster resources',
      attributes: {},
      resources: hanaClusterResources,
      pageTitle: modalTitle,
    },
    {
      description:
        'should render modal with hanaCluster node attributes and empty resources',
      attributes: hanaClusterAttributes,
      resources: [],
      pageTitle: modalTitle,
    },
    {
      description:
        'should render modal with hanaCluster node attributes and resources',
      attributes: hanaClusterAttributes,
      resources: hanaClusterResources,
      pageTitle: modalTitle,
    },
  ];

  it.each(scenarios)(
    '$description',
    async ({ attributes, resources, pageTitle }) => {
      const { htmlObject } = render(
        <AttributesDetails
          attributes={attributes}
          resources={resources}
          title={pageTitle}
        />
      );

      const detailsButton = screen.getByText('Details');
      await userEvent.click(detailsButton);

      expect(screen.getByText(pageTitle)).toBeInTheDocument();
      expect(screen.getByText('Attributes')).toBeInTheDocument();
      expect(screen.getByText('Resources')).toBeInTheDocument();

      screen.debug(htmlObject, 10000000000000000);
      const noData = screen.queryAllByText('No data available');

      if (Object.keys(attributes).length === 0) {
        expect(noData.length).toBeGreaterThanOrEqual(1);
        expect(noData[0].textContent).toBe('No data available');
      } else {
        Object.entries(attributes).forEach(([key, value]) => {
          expect(screen.getByText(key)).toBeInTheDocument();
          expect(screen.getByText(value)).toBeInTheDocument();
        });
      }
      if (resources.length === 0) {
        const expectedNoDataCount =
          Object.keys(attributes).length === 0 ? 2 : 1;
        expect(noData.length).toBeGreaterThanOrEqual(expectedNoDataCount);
        expect(noData[noData.length - 1].textContent).toBe('No data available');
      } else {
        expectedResourceTableHeaders.forEach(({ key, title }) => {
          expect(screen.getByText(title)).toBeInTheDocument();
          resources.forEach((resource) => {
            let value;
            if (key === 'managed') {
              value = resource[key] ? 'True' : 'False';
            } else {
              value = resource[key];
            }
            const elements = screen.queryAllByText(value);
            expect(elements.length).toBeGreaterThan(0);
            elements.forEach((element) => {
              expect(element).toBeInTheDocument();
            });
          });
        });
      }
    }
  );
});
