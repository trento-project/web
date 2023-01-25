defmodule Trento.Domain.Commands.RegisterHost do
  @moduledoc """
  Register a host to the monitoring system.
  """

  @required_fields :all

  use Trento.Command

  defcommand do
    field :host_id, Ecto.UUID
    field :hostname, :string
    field :ip_addresses, {:array, :string}
    field :agent_version, :string
    field :cpu_count, :integer
    field :total_memory_mb, :integer
    field :socket_count, :integer
    field :os_version, :string, default: "Unknown"

    field :installation_source, Ecto.Enum, values: [:community, :suse, :unknown]
  end
end
