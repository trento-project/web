defmodule Trento.Support.EventHandlerFailureContext do
  @moduledoc """
  Event handler failure context

  max_retries: max retries before the event handler is shut down (default: 3)
  retry_after: time between retries in ms (default: 500)
  after_retry: callback to be called after reach retry
  after_max_retries_reached: callback to be called when the max retries are reached
  skip: if skip is true, the event will be skipped, otherwise the process will stop (default: false)
  """

  defmacro __using__(opts \\ []) do
    quote do
      alias Commanded.Event.FailureContext

      require Logger

      def error(
            error,
            event,
            %FailureContext{context: context, metadata: metadata} = failure_context
          ) do
        max_retries = Keyword.get(unquote(opts), :max_retries, 3)
        retry_after = Keyword.get(unquote(opts), :retry_after, 500)
        skip = Keyword.get(unquote(opts), :skip, false)

        after_max_retries_reached =
          Keyword.get(unquote(opts), :after_max_retries_reached, fn _event, _metadata, _context ->
            :ok
          end)

        after_retry =
          Keyword.get(unquote(opts), :after_retry, fn _event, _metadata, _context ->
            :ok
          end)

        Logger.metadata(error: error, event: event, failure_context: failure_context)

        case record_failure(context) do
          %{failures: failures} when failures >= max_retries ->
            :ok = after_max_retries_reached.(event, metadata, context)

            if skip do
              Logger.error(
                "#{__MODULE__} failed to handle event, skipping after #{max_retries} retries"
              )

              :skip
            else
              Logger.error(
                "#{__MODULE__} failed to handle event, stopping after #{max_retries} retries"
              )

              {:error, :max_retries_reached}
            end

          %{failures: failures} = context ->
            :ok = after_retry.(event, metadata, context)

            Logger.error(
              "#{__MODULE__}  failed to handle event, retrying (#{failures}/#{max_retries})..."
            )

            {:retry, retry_after, context}
        end
      end

      defp record_failure(context) do
        Map.update(context, :failures, 1, fn failures -> failures + 1 end)
      end
    end
  end
end
