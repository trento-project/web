defmodule Trento.Discovery.Payloads.HostDiscoveryPayload do
  @moduledoc """
  Host discovery integration event payload
  """

  @required_fields [
    :hostname,
    :ip_addresses,
    :agent_version,
    :cpu_count,
    :total_memory_mb,
    :socket_count,
    :os_version
  ]

  use Trento.Support.Type

  require Trento.Hosts.Enums.Architecture, as: Architecture

  deftype do
    field :hostname, :string
    field :ip_addresses, {:array, :string}
    field :netmasks, {:array, :integer}
    field :agent_version, :string
    field :cpu_count, :integer
    field :total_memory_mb, :integer
    field :socket_count, :integer
    field :os_version, :string
    field :fully_qualified_domain_name, :string
    field :prometheus_targets, :map
    field :systemd_units, {:array, :map}, default: []

    field :installation_source, Ecto.Enum,
      values: [:community, :suse, :unknown],
      default: :unknown

    field :arch, Ecto.Enum,
      values: Architecture.values(),
      default: Architecture.unknown()
  end

  def changeset(host, attrs) do
    modified_attrs =
      attrs
      |> installation_source_to_downcase()
      |> arch_to_downcase()
      |> handle_systemd_units()

    host
    |> cast(modified_attrs, fields())
    |> validate_required_fields(@required_fields)
  end

  defp installation_source_to_downcase(%{"installation_source" => installation_source} = attrs),
    do: %{attrs | "installation_source" => String.downcase(installation_source)}

  defp installation_source_to_downcase(attrs), do: attrs

  defp arch_to_downcase(%{"arch" => arch} = attrs),
    do: %{attrs | "arch" => String.downcase(arch)}

  defp arch_to_downcase(attrs), do: attrs

  defp handle_systemd_units(%{"systemd_units" => nil} = attrs),
    do: %{attrs | "systemd_units" => []}

  defp handle_systemd_units(attrs), do: attrs
end
