defmodule Trento.Integration.Prometheus do
  @moduledoc """
  Prometheus integration service
  """

  alias Trento.Repo

  alias Trento.HostReadModel

  @node_exporter_port 9100
  @node_exporter_name "Node Exporter"

  def get_targets do
    HostReadModel
    |> Repo.all()
    |> Enum.map(fn host ->
      %{
        "targets" => ["#{host.ssh_address}:#{@node_exporter_port}"],
        "labels" => %{
          "host_id" => "#{host.id}",
          "hostname" => "#{host.hostname}",
          "exporter_name" => @node_exporter_name
        }
      }
    end)
  end
end
