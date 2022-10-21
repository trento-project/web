defmodule Trento.Integration.Checks.Wanda.Messaging.AMQP.Processor do
  @moduledoc """
  AMQP processor.
  """

  @behaviour GenRMQ.Processor

  alias Trento.Contracts

  require Logger

  def process(%GenRMQ.Message{payload: payload} = message) do
    Logger.debug("Received message: #{inspect(message)}")

    with {:ok, event} <- Contracts.from_event(payload),
         {:ok, command, opts} <- adapter().handle(event) do
      Trento.Commanded.dispatch(command, opts)
    else
      {:error, reason} ->
        {:error, reason}
    end
  end

  defp adapter,
    do: Application.fetch_env!(:trento, Trento.Integration.Checks.Wanda)[:policy]
end
