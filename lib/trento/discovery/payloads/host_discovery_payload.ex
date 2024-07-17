defmodule Trento.Discovery.Payloads.HostDiscoveryPayload do
  @moduledoc """
  Host discovery integration event payload
  """

  @required_fields [
    :hostname,
    :agent_version,
    :cpu_count,
    :total_memory_mb,
    :socket_count,
    :os_version,
    :network_interfaces
  ]

  use Trento.Support.Type

  deftype do
    field :hostname, :string
    field :agent_version, :string
    field :cpu_count, :integer
    field :total_memory_mb, :integer
    field :socket_count, :integer
    field :os_version, :string
    field :fully_qualified_domain_name, :string

    field :installation_source, Ecto.Enum,
      values: [:community, :suse, :unknown],
      default: :unknown

    embeds_many :network_interfaces, __MODULE__.NetworkInterface
  end

  def changeset(host, attrs) do
    modified_attrs = installation_source_to_downcase(attrs)

    host
    |> cast(modified_attrs, fields())
    |> cast_embed(:network_interfaces)
    |> validate_required_fields(@required_fields)
  end

  defp installation_source_to_downcase(%{"installation_source" => installation_source} = attrs),
    do: %{attrs | "installation_source" => String.downcase(installation_source)}

  defp installation_source_to_downcase(attrs), do: attrs

  defmodule NetworkInterface do
    @moduledoc nil

    @required_fields [:index, :name]
    use Trento.Support.Type

    deftype do
      field :index, :integer
      field :name, :string

      embeds_many :addresses, IpAddress, primary_key: false do
        field :address, :string
        field :netmask, :integer
      end
    end

    def changeset(interface, attrs) do
      interface
      |> cast(attrs, [:index, :name])
      |> cast_embed(:addresses, with: &ip_address_changeset/2)
      |> validate_required_fields(@required_fields)
    end

    defp ip_address_changeset(address, attrs) do
      address
      |> cast(attrs, [:address, :netmask])
      |> validate_required([:address])
    end
  end
end
