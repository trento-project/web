import { faker } from '@faker-js/faker';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { act } from 'react-dom/test-utils';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import NotificationBox from './NotificationBox';

describe('NotificationBox Component', () => {
  it('should display a Notification box with a single text message', async () => {
    const user = userEvent.setup();

    const icon = faker.color.human();
    const text = faker.lorem.sentence();
    const buttonText = faker.lorem.word();
    const buttonOnClick = jest.fn();

    render(
      <NotificationBox
        icon={icon}
        text={text}
        buttonText={buttonText}
        buttonOnClick={buttonOnClick}
      />
    );

    const button = screen.getByRole('button');

    expect(screen.getByText(icon)).toBeTruthy();
    expect(screen.getByText(text)).toBeTruthy();
    expect(button).toHaveTextContent(buttonText);

    await act(async () => user.click(button));

    expect(buttonOnClick).toHaveBeenCalled();
  });

  it('should display a Notification box with a list of text messages', () => {
    const icon = faker.color.human();
    const buttonText = faker.lorem.word();
    const buttonOnClick = jest.fn();

    const texts = [faker.lorem.sentence(), faker.lorem.sentence()];

    render(
      <NotificationBox
        icon={icon}
        text={texts}
        buttonText={buttonText}
        buttonOnClick={buttonOnClick}
      />
    );

    texts.forEach((text) => expect(screen.getByText(text)).toBeTruthy());
  });
});
