defmodule Tronto.Monitoring do
  @moduledoc """
  This module encapuslates the access to the monitoring bounded context
  """

  alias Tronto.Monitoring.Integration.Discovery

  def handle_discovery_event(event) do
    case Discovery.handle_discovery_event(event) do
      {:ok, command} ->
        Tronto.Commanded.dispatch(command)

      {:error, _} = error ->
        error
    end
  end
end
