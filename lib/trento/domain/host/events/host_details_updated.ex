defmodule Trento.Domain.Events.HostDetailsUpdated do
  @moduledoc """
  This event is emitted when host details are updated.
  """

  use Trento.Event

  defevent version: 2 do
    field :host_id, Ecto.UUID
    field :hostname, :string
    field :ip_addresses, {:array, :string}
    field :ssh_address, :string
    field :agent_version, :string
    field :cpu_count, :integer
    field :total_memory_mb, :integer
    field :socket_count, :integer
    field :os_version, :string

    field :installation_source, Ecto.Enum, values: [:community, :suse, :unknown]
  end

  def upcast(params, _, 2), do: Map.put(params, "installation_source", :unknown)
end
