/**
 * Model the lifecycle of an API request
 *
 * * initial: The request has not been made yet
 * * loading: The request is in progress
 * * success: The request was successful, and the response is available
 * * failure: The request failed, and the error is available
 */

export const initial = () => ({
  status: 'initial',
});

export const success = (response) => ({
  status: 'success',
  response,
});

export const failure = (error) => ({
  status: 'failure',
  error,
});

export const loading = () => ({
  status: 'loading',
});
