import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import {
  UserMessageContainer,
  AssistantMessageContainer,
} from './MessageContainer';

jest.mock('@assistant-ui/react', () => ({
  AuiIf: () => null,
  ErrorPrimitive: {
    Root: ({ children }) => <div>{children}</div>,
    Message: () => <span>Error message</span>,
  },
  MessagePrimitive: {
    Root: ({ children, ...props }) => <div {...props}>{children}</div>,
    Parts: () => <span data-testid="parts">parts</span>,
    Error: ({ children }) => <div data-testid="error-slot">{children}</div>,
  },
  useAuiState: () => ({ content: [] }),
}));

jest.mock('@assistant-ui/react-markdown', () => ({
  MarkdownTextPrimitive: () => null,
}));

jest.mock('@assistant-ui/react-markdown/styles/dot.css', () => ({}), { virtual: true });

describe('MessageContainer', () => {
  describe('UserMessageContainer', () => {
    it('renders the user bubble with the parts slot', () => {
      const { container } = render(<UserMessageContainer />);
      expect(container.querySelector('[data-role="user"]')).toBeInTheDocument();
      expect(screen.getByText('You')).toBeVisible();
      expect(screen.getByTestId('parts')).toBeVisible();
    });
  });

  describe('AssistantMessageContainer', () => {
    it('renders the assistant bubble with the parts and error slots', () => {
      const { container } = render(<AssistantMessageContainer />);
      expect(container.querySelector('[data-role="assistant"]')).toBeInTheDocument();
      expect(screen.queryByText('You')).toBeNull();
      expect(screen.getByTestId('parts')).toBeVisible();
      expect(screen.getByTestId('error-slot')).toBeInTheDocument();
    });
  });
});
