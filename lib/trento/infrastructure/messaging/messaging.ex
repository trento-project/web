defmodule Trento.Infrastructure.Messaging do
  @moduledoc """
  Publishes messages to the message bus
  """

  @spec publish(module(), String.t(), any()) :: :ok | {:error, any}
  def publish(publisher, topic, message) do
    adapter().publish(publisher, topic, message)
  end

  defp adapter,
    do: Application.fetch_env!(:trento, __MODULE__)[:adapter]
end
