defmodule Trento.Infrastructure.Prometheus do
  @moduledoc """
  Prometheus integration service
  """

  alias Trento.Hosts
  alias Trento.Infrastructure.Prometheus.PromQL

  @spec get_targets :: [map]
  def get_targets do
    Hosts.get_hosts_for_prometheus_targets()
  end

  @spec get_exporters_status(String.t()) :: {:ok, map} | {:error, any}
  def get_exporters_status(host_id), do: adapter().get_exporters_status(host_id)

  @spec query(String.t(), String.t(), DateTime.t()) :: {:ok, map} | {:error, any}
  def query(host_id, query, time) do
    scoped_query = PromQL.inject_label(query, "agentID", host_id)
    adapter().query(scoped_query, time)
  end

  @spec query_range(String.t(), String.t(), DateTime.t(), DateTime.t()) ::
          {:ok, map} | {:error, any}
  def query_range(host_id, query, from, to) do
    scoped_query = PromQL.inject_label(query, "agentID", host_id)
    adapter().query_range(scoped_query, from, to)
  end

  defp adapter,
    do: Application.fetch_env!(:trento, __MODULE__)[:adapter]
end
