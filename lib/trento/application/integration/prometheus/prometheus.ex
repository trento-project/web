defmodule Trento.Integration.Prometheus do
  @moduledoc """
  Prometheus integration service
  """

  alias Trento.Repo

  alias Trento.HostReadModel

  @node_exporter_port 9100
  @node_exporter_name "Node Exporter"

  @spec get_targets :: [map]
  def get_targets do
    HostReadModel
    |> Repo.all()
    |> Enum.map(fn host ->
      %{
        "targets" => ["#{host.ssh_address}:#{@node_exporter_port}"],
        "labels" => %{
          # TODO: in the future renaeme this label which also is used by node_exporter json
          "agentID" => "#{host.id}",
          "hostname" => "#{host.hostname}",
          "exporter_name" => @node_exporter_name
        }
      }
    end)
  end

  @spec get_exporters_status(String.t()) :: {:ok, map} | {:error, any}
  def get_exporters_status(host_id), do: adapter().get_exporters_status(host_id)

  defp adapter,
    do: Application.fetch_env!(:trento, __MODULE__)[:adapter]
end
