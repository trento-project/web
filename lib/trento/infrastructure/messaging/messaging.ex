defmodule Trento.Messaging do
  @moduledoc """
  Publishes messages to the message bus
  """

  @spec publish(String.t(), any()) :: :ok | {:error, any()}
  def publish(topic, message) do
    adapter().publish(topic, message)
  end

  defp adapter,
    do: Application.fetch_env!(:trento, :messaging)[:adapter]
end
