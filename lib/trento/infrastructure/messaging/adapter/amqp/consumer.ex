defmodule Trento.Infrastructure.Messaging.Adapter.AMQP.Consumer do
  @moduledoc """
  AMQP consumer.
  """
  defmacro __using__(opts) do
    id = Keyword.fetch!(opts, :id)
    name = Keyword.fetch!(opts, :name)

    quote do
      @behaviour GenRMQ.Consumer

      require Logger

      @impl GenRMQ.Consumer
      def init do
        config =
          Application.fetch_env!(:trento, Trento.Infrastructure.Messaging.Adapter.AMQP)[
            unquote(name)
          ][:consumer]

        Keyword.merge(config,
          retry_delay_function: fn attempt -> :timer.sleep(2000 * attempt) end
        )
      end

      @spec start_link(any) :: {:error, any} | {:ok, pid}
      def start_link(_opts), do: GenRMQ.Consumer.start_link(__MODULE__, name: via_tuple())

      @impl GenRMQ.Consumer
      def handle_message(%GenRMQ.Message{} = message) do
        case processor().process(message) do
          :ok ->
            GenRMQ.Consumer.ack(message)

          {:error, reason} ->
            handle_error(message, reason)
        end
      end

      @impl GenRMQ.Consumer
      def handle_error(
            %GenRMQ.Message{attributes: attributes, payload: payload} = message,
            reason
          ) do
        Logger.error(
          "Rejecting message due to consumer task error: #{inspect(reason: reason, msg_attributes: attributes, msg_payload: payload)}"
        )

        GenRMQ.Consumer.reject(message, false)
      end

      @impl GenRMQ.Consumer
      def consumer_tag, do: "trento_#{unquote(name)}"

      def child_spec(opts) do
        %{
          id: unquote(id),
          name: via_tuple(),
          start: {__MODULE__, :start_link, [opts]},
          type: :worker,
          restart: :permanent,
          shutdown: 500
        }
      end

      defp processor,
        do:
          Application.fetch_env!(:trento, Trento.Infrastructure.Messaging.Adapter.AMQP)[
            unquote(name)
          ][:processor]

      defp via_tuple,
        do: {:via, :global, {__MODULE__, unquote(name)}}
    end
  end
end
