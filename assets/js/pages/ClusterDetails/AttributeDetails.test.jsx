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

  const assertAttributesDisplayed = (attributes) => {
    Object.entries(attributes).forEach(([key, value]) => {
      expect(screen.getByText(key)).toBeInTheDocument();
      expect(screen.getByText(value)).toBeInTheDocument();
    });
  };

  const assertResourcesDisplayed = (resources, expectedResource) => {
    expectedResource.forEach(({ key, title }) => {
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
  };

  it.each(scenarios)(
    '$description',
    async ({ attributes, resources, pageTitle }) => {
      render(
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

      const isAttributesEmpty = Object.keys(attributes).length === 0;
      const isResourcesEmpty = resources.length === 0;
      const noDataElements = screen.queryAllByText('No data available');

      if (isAttributesEmpty && isResourcesEmpty) {
        expect(noDataElements).toHaveLength(2);
      } else if (!isAttributesEmpty && isResourcesEmpty) {
        expect(noDataElements).toHaveLength(1);
        assertAttributesDisplayed(attributes);
      } else if (isAttributesEmpty && !isResourcesEmpty) {
        expect(noDataElements).toHaveLength(1);
        assertResourcesDisplayed(resources, expectedResourceTableHeaders);
      } else {
        expect(noDataElements).toHaveLength(0);

        assertAttributesDisplayed(attributes);
        assertResourcesDisplayed(resources, expectedResourceTableHeaders);
      }
    }
  );
});
