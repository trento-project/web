import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { faker } from '@faker-js/faker';
import { activityLogEntryFactory } from '@lib/test-utils/factories/activityLog';
import { renderWithRouter } from '@lib/test-utils';

import { ACTIVITY_TYPES, toLabel, toResource } from '@lib/model/activityLog';
import { toRenderedEntry } from '@common/ActivityLogOverview/ActivityLogOverview';
import ActivityLogDetailModal from '.';

describe('ActivityLogDetailModal component', () => {
  const scenarios = ACTIVITY_TYPES.map((activityType) => {
    const entry = activityLogEntryFactory.build({
      type: activityType,
    });
    return {
      name: activityType,
      entry,
      expectedActivityType: toLabel(entry),
      expectedResource: toResource(entry),
    };
  });

  it.each(scenarios)(
    'should render detail for activity entry `$name`',
    async ({
      entry,
      expectedActivityType,
      expectedResource,
      userRelatedActivity = false,
    }) => {
      const { id } = entry;
      await act(async () => {
        render(<ActivityLogDetailModal open entry={toRenderedEntry(entry)} />);
      });

      expect(screen.getByText('ID')).toBeVisible();
      expect(screen.getByText(id)).toBeVisible();

      expect(screen.getByText('Activity Type')).toBeVisible();
      expect(screen.getByText(expectedActivityType)).toBeVisible();

      expect(screen.getByText('Resource')).toBeVisible();
      const resource = screen.getByLabelText('activity-log-resource');
      expect(resource).toBeVisible();
      expect(resource).toHaveTextContent(expectedResource);

      const userReferences = screen.getAllByText('User');
      if (userRelatedActivity) {
        expect(userReferences).toHaveLength(2);
      }
      userReferences.forEach((userReference) => {
        expect(userReference).toBeVisible();
      });

      expect(screen.getByText('Message')).toBeVisible();
      expect(screen.getByText('Created at')).toBeVisible();
    }
  );

  it('should render detail for unknown activity type', async () => {
    const unknownActivityType = faker.lorem.word();
    const entry = activityLogEntryFactory.build({ type: unknownActivityType });
    await act(async () => {
      render(<ActivityLogDetailModal open entry={toRenderedEntry(entry)} />);
    });

    const activityReferences = screen.getAllByText(unknownActivityType);
    expect(activityReferences).toHaveLength(2);
    activityReferences.forEach((activityReference) => {
      expect(activityReference).toBeVisible();
    });

    expect(screen.getByText('Unrecognized resource')).toBeVisible();
  });
  it('should render Related Events field for entries with correlation_id present in metadata', async () => {
    const unknownActivityType = faker.lorem.word();
    const metadata = {correlation_id: "some-uuid"};
    const entry = activityLogEntryFactory.build({ metadata, type: unknownActivityType});
    await act(async () => {
      renderWithRouter(<ActivityLogDetailModal open entry={toRenderedEntry(entry)} />);
    });

    expect(screen.getByText('Related Events')).toBeVisible();
    expect(screen.getByText('Show Events')).toBeVisible();
  });
  it('should not render Related Events field for entries with correlation_id absent in metadata', async () => {
    const unknownActivityType = faker.lorem.word();
    const metadata = {some_key: "some-value"};
    const entry = activityLogEntryFactory.build({ metadata, type: unknownActivityType});
    await act(async () => {
      renderWithRouter(<ActivityLogDetailModal open entry={toRenderedEntry(entry)} />);
    });

    expect(() => screen.getByText('Related Events')).toThrow();
    expect(() => screen.getByText('Show Events')).toThrow();
  });



  it('should call onClose when the close button is clicked', async () => {
    const onClose = jest.fn();
    await act(async () => {
      render(
        <ActivityLogDetailModal
          open
          entry={activityLogEntryFactory.build()}
          onClose={onClose}
        />
      );
    });

    await userEvent.click(screen.getByText('Close'));
    expect(onClose).toHaveBeenCalled();
  });
});
