import React from 'react';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import { faker } from '@faker-js/faker';
import Accordion from './Accordion';

describe('Accordion Component', () => {
  it('should render an Accordion', () => {
    const accordionHeader = faker.lorem.sentence();
    const accordionContent = faker.lorem.paragraph();

    render(
      <Accordion header={accordionHeader}>
        <div>{accordionContent}</div>
      </Accordion>
    );

    const header = screen.getByLabelText('accordion-header');

    expect(screen.getByLabelText('accordion-handle')).toBeVisible();
    expect(header).toHaveTextContent(accordionHeader);
    expect(screen.queryByLabelText('accordion-panel')).not.toBeInTheDocument();

    expect(
      screen.queryByLabelText('accordion-transition-panel')
    ).not.toBeInTheDocument();

    fireEvent.click(header);
    expect(screen.getByLabelText('accordion-panel')).toHaveTextContent(
      accordionContent
    );
    expect(
      screen.queryByLabelText('accordion-transition-panel')
    ).not.toBeInTheDocument();
  });

  it('should render an Accordion with a custom header', () => {
    const accordionHeader = faker.lorem.sentence();

    render(
      <Accordion
        header={<div data-testid="custom-header">{accordionHeader}</div>}
      >
        <div>{faker.lorem.paragraph()}</div>
      </Accordion>
    );

    expect(screen.getByTestId('custom-header')).toBeVisible();
    expect(screen.getByLabelText('accordion-header')).toHaveTextContent(
      accordionHeader
    );
  });

  it('should render an Accordion without a handle', () => {
    render(
      <Accordion header={faker.lorem.sentence()} withHandle={false}>
        <div>{faker.lorem.paragraph()}</div>
      </Accordion>
    );

    expect(screen.queryByLabelText('accordion-handle')).not.toBeInTheDocument();
  });

  it('should render an Accordion with a transitioning panel', async () => {
    const accordionContent = faker.lorem.paragraph();

    render(
      <Accordion header={faker.lorem.sentence()} withTransition>
        <div>{accordionContent}</div>
      </Accordion>
    );

    expect(
      screen.queryByLabelText('accordion-transition-panel')
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('accordion-header'));
    await waitFor(() => {
      const transitionPanel = screen.getByLabelText(
        'accordion-transition-panel'
      );
      expect(transitionPanel).toBeVisible();
      expect(screen.getByLabelText('accordion-panel')).toHaveTextContent(
        accordionContent
      );
    });
  });
});
