defmodule Trento.Hosts.Commands.RegisterHost do
  @moduledoc """
  Register a host to the monitoring system.
  """
  alias Trento.Hosts.ValueObjects.SystemdUnit

  @required_fields [
    :host_id,
    :hostname,
    :ip_addresses,
    :agent_version,
    :cpu_count,
    :total_memory_mb,
    :socket_count,
    :os_version
  ]

  use Trento.Support.Command

  require Trento.Hosts.Enums.Architecture, as: Architecture

  defcommand do
    field :host_id, Ecto.UUID
    field :hostname, :string
    field :ip_addresses, {:array, :string}
    field :agent_version, :string
    field :cpu_count, :integer
    field :total_memory_mb, :integer
    field :socket_count, :integer
    field :os_version, :string, default: "Unknown"
    field :fully_qualified_domain_name, :string
    field :prometheus_targets, :map

    field :installation_source, Ecto.Enum, values: [:community, :suse, :unknown]
    field :arch, Ecto.Enum, values: Architecture.values()

    embeds_many :systemd_units, SystemdUnit
  end
end
