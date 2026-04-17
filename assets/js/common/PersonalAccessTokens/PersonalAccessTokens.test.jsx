import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { format, formatISO } from 'date-fns';
import { tz } from '@date-fns/tz';
import { faker } from '@faker-js/faker';
import { personalAccessTokenFactory } from '@lib/test-utils/factories';
import { DEFAULT_TIMEZONE, DATE_DAY_MONTH_YEAR_FORMAT } from '@lib/timezones';
import PersonalAccessTokens from './PersonalAccessTokens';

describe('PersonalAccessTokens', () => {
  it('should show personal access tokens', () => {
    const tokens = personalAccessTokenFactory.buildList(3);
    render(
      <PersonalAccessTokens
        personalAccessTokens={tokens}
        timezone={DEFAULT_TIMEZONE}
      />
    );

    expect(screen.getByText('Personal Access Tokens')).toBeInTheDocument();

    tokens.forEach(({ name, expires_at: expiresAt }) => {
      expect(screen.getByText(name)).toBeInTheDocument();
      expect(
        screen.getByText(
          `Expires: ${format(expiresAt, DATE_DAY_MONTH_YEAR_FORMAT, {
            in: tz(DEFAULT_TIMEZONE),
          })}`
        )
      ).toBeInTheDocument();
    });
  });

  it('should show an empty list of tokens', () => {
    render(
      <PersonalAccessTokens
        personalAccessTokens={[]}
        timezone={DEFAULT_TIMEZONE}
      />
    );

    expect(screen.getByText('No keys issued.')).toBeInTheDocument();
  });

  it('should show token without expiration', () => {
    const token = personalAccessTokenFactory.build({
      expires_at: null,
    });
    render(
      <PersonalAccessTokens
        personalAccessTokens={[token]}
        timezone={DEFAULT_TIMEZONE}
      />
    );

    expect(screen.getByText('Expires: Never')).toBeInTheDocument();
  });

  it('should display token expiration date with timezone day rollover', () => {
    const expiresAt = '2024-01-10T23:30:00.000Z';
    const timezone = 'Pacific/Kiritimati';
    const token = personalAccessTokenFactory.build({
      expires_at: expiresAt,
    });

    render(
      <PersonalAccessTokens
        personalAccessTokens={[token]}
        timezone={timezone}
      />
    );

    expect(screen.getByText('Expires: 11 Jan 2024')).toBeInTheDocument();
  });

  it('should show expired tokens with a red color', () => {
    const token = personalAccessTokenFactory.build({
      expires_at: formatISO(faker.date.past()),
    });
    render(
      <PersonalAccessTokens
        personalAccessTokens={[token]}
        timezone={DEFAULT_TIMEZONE}
      />
    );

    expect(
      screen
        .getByText(
          `Expires: ${format(token.expires_at, DATE_DAY_MONTH_YEAR_FORMAT, {
            in: tz(DEFAULT_TIMEZONE),
          })}`
        )
        .classList.toString()
    ).toContain('text-red-500');
  });

  it('should show token generation button', () => {
    render(<PersonalAccessTokens generateTokenAvailable />);

    expect(
      screen.getByRole('button', { name: 'generate-token' })
    ).toBeInTheDocument();
  });

  it('should not show token generation button', () => {
    render(<PersonalAccessTokens generateTokenAvailable={false} />);

    expect(
      screen.queryByRole('button', { name: 'generate-token' })
    ).not.toBeInTheDocument();
  });

  it('should open generate token modal when the button is clicked', async () => {
    const user = userEvent.setup();
    render(<PersonalAccessTokens generateTokenAvailable />);

    await user.click(screen.getByRole('button', { name: 'generate-token' }));

    expect(
      screen.getByText('Generate Personal Access Token')
    ).toBeInTheDocument();
  });

  it('should delete token when confirmation modal delete button is clicked', async () => {
    const user = userEvent.setup();
    const token = personalAccessTokenFactory.build();
    const mockOnDeleteToken = jest.fn();
    render(
      <PersonalAccessTokens
        personalAccessTokens={[token]}
        onDeleteToken={mockOnDeleteToken}
      />
    );

    await user.click(screen.getByRole('button', { name: 'delete-token' }));
    await user.click(screen.getByRole('button', { name: 'Delete Token' }));

    expect(mockOnDeleteToken).toHaveBeenCalledWith(token.id);
  });

  it('should generate token when generation modal generate is clicked', async () => {
    const user = userEvent.setup();
    const tokenName = 'My token';
    const mockOnGenerateToken = jest.fn();
    render(
      <PersonalAccessTokens
        generateTokenAvailable
        onGenerateToken={mockOnGenerateToken}
      />
    );

    await user.click(screen.getByRole('button', { name: 'generate-token' }));

    await user.type(screen.getByRole('textbox'), tokenName);
    await user.click(screen.getByRole('button', { name: 'Generate Token' }));
    expect(mockOnGenerateToken).toHaveBeenCalledWith(
      tokenName,
      expect.any(Date)
    );
  });

  it('should show new token modal if the generated token is given', async () => {
    const user = userEvent.setup();
    const token = faker.internet.jwt();
    const mockOnCloseGenerated = jest.fn();
    render(
      <PersonalAccessTokens
        generatedAccessToken={token}
        onCloseGeneratedTokenModal={mockOnCloseGenerated}
      />
    );

    expect(screen.getByText('Generated Token')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(mockOnCloseGenerated).toHaveBeenCalled();
  });
});
