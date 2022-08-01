defmodule Trento.Integration.Discovery.HostDiscoveryPayload do
  @moduledoc """
  Host discovery integration event payload
  """

  @required_fields [
    :hostname,
    :ip_addresses,
    :ssh_address,
    :agent_version,
    :cpu_count,
    :total_memory_mb,
    :socket_count,
    :os_version
  ]

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

    field :installation_source, Ecto.Enum,
      values: [:community, :suse, :unknown],
      default: :unknown
  end

  def changeset(host, attrs) do
    modified_attrs =
      attrs
      |> installation_source_to_downcase

    host
    |> cast(modified_attrs, fields())
    |> validate_required_fields(@required_fields)
  end

  defp installation_source_to_downcase(%{"installation_source" => installation_source} = attrs),
    do: %{attrs | "installation_source" => String.downcase(installation_source)}

  defp installation_source_to_downcase(attrs), do: attrs
end
