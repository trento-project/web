defmodule Trento.Domain.Events.HostRegistered do
  @moduledoc """
  This event is emitted when a host is registered.
  """

  use Trento.Event

  defevent do
    field :host_id, Ecto.UUID
    field :hostname, :string
    field :ip_addresses, {:array, :string}
    field :ssh_address, :string
    field :agent_version, :string
    field :cpu_count, :integer
    field :total_memory_mb, :integer
    field :socket_count, :integer
    field :os_version, :string
    field :heartbeat, Ecto.Enum, values: [:unknown]
  end
end
