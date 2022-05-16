defmodule Trento.Integration.Discovery.HostDiscoveryPayload do
  @moduledoc """
  Host discovery integration event payload
  """

  @required_fields :all

  use Trento.Type

  deftype do
    field :hostname, :string
    field :ip_addresses, {:array, :string}
    field :ssh_address, :string
    field :agent_version, :string
    field :cpu_count, :integer
    field :total_memory_mb, :integer
    field :socket_count, :integer
    field :os_version, :string
  end
end
