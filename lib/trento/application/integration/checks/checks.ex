defmodule Trento.Integration.Checks do

  alias Trento.Integration.Checks.Models.Catalog

  @moduledoc """
  Checks runner service integration
  """
  @spec request_execution(String.t(), String.t(), [String.t()], [String.t()]) ::
          :ok | {:error, any}
  def request_execution(execution_id, cluster_id, hosts, selected_checks),
    do: adapter().request_execution(execution_id, cluster_id, hosts, selected_checks)

  @spec get_catalog() ::
          {:ok, Catalog.t()} | {:error, any}
  def get_catalog(),
    do: adapter().get_catalog(runner_url())

  defp adapter,
    do: Application.fetch_env!(:trento, __MODULE__)[:adapter]

  defp runner_url,
    do: Application.fetch_env!(:trento, __MODULE__)[:runner_url]

end
