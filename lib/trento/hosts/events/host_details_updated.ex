defmodule Trento.Hosts.Events.HostDetailsUpdated do
  @moduledoc """
  This event is emitted when host details are updated.
  """

  use Trento.Support.Event

  require Trento.Hosts.Enums.Architecture, as: Architecture

  alias Trento.Hosts.ValueObjects.SystemdUnit

  defevent version: 5 do
    field :host_id, Ecto.UUID
    field :hostname, :string
    field :fully_qualified_domain_name, :string
    field :ip_addresses, {:array, :string}
    field :agent_version, :string
    field :cpu_count, :integer
    field :total_memory_mb, :integer
    field :socket_count, :integer
    field :os_version, :string
    field :prometheus_targets, :map
    embeds_many :systemd_units, SystemdUnit

    field :installation_source, Ecto.Enum, values: [:community, :suse, :unknown]
    field :arch, Ecto.Enum, values: Architecture.values()
  end

  def upcast(params, _, 2), do: Map.put(params, "installation_source", :unknown)
  def upcast(params, _, 3), do: Map.put(params, "fully_qualified_domain_name", nil)
  def upcast(params, _, 4), do: Map.put(params, "prometheus_targets", nil)
  def upcast(params, _, 5), do: Map.put(params, "arch", Architecture.unknown())
  def upcast(params, _, 6), do: Map.put(params, "systemd_units", [])
end
