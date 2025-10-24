import React from 'react';

/**
 * ErrorBoundary
 *
 * Test-only ErrorBoundary component that captures rendering errors from its children
 * and forwards them to an optional onError callback instead of rendering a fallback UI.
 *
 * This test util is needed because React 19 does not throw on failed rendering in the same
 * way older versions did during tests; using this boundary allows tests to observe and
 * assert on rendering errors via a spy.
 * @see https://react.dev/blog/2024/04/25/react-19-upgrade-guide#errors-in-render-are-not-re-thrown
 *
 * @component
 *
 * @param {Object} props
 * @param {import('react').ReactNode} props.children - Child subtree to render. If a child throws,
 *   the boundary will catch the error and stop rendering the subtree.
 * @param {(error: Error) => void} [props.onError] - Optional callback invoked with the caught Error.
 *   Useful for assertions in tests (e.g. jest.fn spy).
 *
 * Behavior:
 * - Uses static getDerivedStateFromError to set internal state { hasError: true, error } when a child throws.
 * - When hasError is true, calls onError(error) (if provided) and renders null.
 * - Otherwise renders children transparently.
 *
 * @example
 * // Example test using Jest + React Testing Library
 * import { render } from '@testing-library/react';
 * import ErrorBoundary from './ErrorBoundary';
 *
 * test('forwards rendering errors to onError spy', () => {
 *   const errorSpy = jest.fn();
 *   function Bomb() { throw new Error('boom'); }
 *
 *   render(
 *     <ErrorBoundary onError={errorSpy}>
 *       <Bomb />
 *     </ErrorBoundary>
 *   );
 *
 *   expect(errorSpy).toHaveBeenCalled();
 *   const caught = errorSpy.mock.calls[0][0];
 *   expect(caught).toBeInstanceOf(Error);
 *   expect(caught.message).toBe('boom');
 * });
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    const { hasError, error } = this.state;
    const { children, onError = () => {} } = this.props;
    if (hasError) {
      onError(error);
      return null;
    }
    return children;
  }
}
