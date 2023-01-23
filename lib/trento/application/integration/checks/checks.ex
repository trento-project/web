defmodule Trento.Integration.Checks do
  @moduledoc """
  Checks runner service integration
  """

  @spec request_execution(String.t(), String.t(), atom, [map], [String.t()]) ::
          :ok | {:error, any}
  def request_execution(execution_id, cluster_id, provider, host_settings, selected_checks),
    do:
      adapter().request_execution(
        execution_id,
        cluster_id,
        provider,
        host_settings,
        selected_checks
      )

  defp adapter,
    do: Application.fetch_env!(:trento, __MODULE__)[:adapter]
end
