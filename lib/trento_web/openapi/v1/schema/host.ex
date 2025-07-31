defmodule TrentoWeb.OpenApi.V1.Schema.Host do
  @moduledoc false

  require OpenApiSpex
  alias OpenApiSpex.Schema

  require Trento.Clusters.Enums.ClusterHostStatus, as: ClusterHostStatus

  alias TrentoWeb.OpenApi.V1.Schema.{
    HostArchitecture,
    Provider,
    ResourceHealth,
    SaptuneStatus,
    SlesSubscription,
    Tags
  }

  defmodule IPv4 do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "IPv4",
        description: "IPv4 address format.",
        type: :string,
        format: :ipv4,
        example: "192.168.1.100"
      },
      struct?: false
    )
  end

  defmodule IPv6 do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "IPv6",
        description: "IPv6 address format.",
        type: :string,
        format: :ipv6,
        example: "2001:db8::1"
      },
      struct?: false
    )
  end

  defmodule SystemdUnit do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "SystemdUnit",
        description: "Systemd service unit information.",
        type: :object,
        additionalProperties: false,
        properties: %{
          name: %Schema{type: :string, description: "Name of the systemd unit"},
          unit_file_state: %Schema{
            type: :string,
            description: "State of the systemd unit. Whether it is enabled or disabled."
          }
        },
        example: %{
          name: "sapinit",
          unit_file_state: "enabled"
        }
      },
      struct?: false
    )
  end

  defmodule HostItem do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "Host",
        description: "A discovered host on the target infrastructure.",
        type: :object,
        additionalProperties: false,
        properties: %{
          id: %Schema{type: :string, description: "Host ID.", format: :uuid},
          hostname: %Schema{type: :string, description: "Host name"},
          ip_addresses: %Schema{
            type: :array,
            description: "IP addresses.",
            items: %Schema{
              description: "IP address (IPv4 or IPv6).",
              anyOf: [
                IPv4,
                IPv6
              ]
            }
          },
          netmasks: %Schema{
            type: :array,
            description:
              "Netmasks associated to the ip_addresses field. The position of the item is associated to the ip address position in ip_addresses.",
            items: %Schema{type: :integer, nullable: true}
          },
          agent_version: %Schema{
            type: :string,
            description: "Version of the agent installed on the host."
          },
          systemd_units: %Schema{
            description: "A list of systemd units on the host.",
            type: :array,
            items: SystemdUnit
          },
          arch: HostArchitecture,
          health: ResourceHealth,
          cluster_id: %Schema{
            type: :string,
            description: "Identifier of the cluster this host is part of.",
            format: :uuid,
            nullable: true
          },
          cluster_host_status: %Schema{
            type: :string,
            description: "Status of host in the cluster is part of.",
            enum: ClusterHostStatus.values(),
            nullable: true
          },
          heartbeat: %Schema{
            type: :string,
            description: "Host's last heartbeat status.",
            enum: [:critical, :passing, :unknown]
          },
          provider: Provider.SupportedProviders,
          provider_data: Provider.ProviderData,
          tags: Tags,
          sles_subscriptions: %Schema{
            description: "A list of the available SLES Subscriptions on a host.",
            type: :array,
            items: SlesSubscription
          },
          selected_checks: %Schema{
            description: "A list of check ids selected for an execution on this host.",
            type: :array,
            items: %Schema{type: :string}
          },
          saptune_status: SaptuneStatus,
          deregistered_at: %Schema{
            description: "Timestamp of the last deregistration of the host.",
            type: :string,
            nullable: true,
            format: :"date-time"
          },
          last_heartbeat_timestamp: %Schema{
            description: "Timestamp of the last heartbeat received from the host.",
            type: :string,
            nullable: true,
            format: :"date-time"
          },
          inserted_at: %Schema{type: :string, format: :datetime},
          updated_at: %Schema{type: :string, format: :datetime, nullable: true}
        },
        example: %{
          id: "9876b7a8-2e1f-4b9a-8e7d-3a4b5c6d7e8f",
          hostname: "hana01",
          ip_addresses: ["192.168.1.100", "2001:db8::1"],
          netmasks: [24, 64],
          agent_version: "1.2.3",
          systemd_units: [
            %{
              name: "sapinit",
              unit_file_state: "enabled"
            }
          ],
          arch: "x86_64",
          health: "passing",
          cluster_id: "123e4567-e89b-12d3-a456-426614174000",
          cluster_host_status: "online",
          heartbeat: "passing",
          provider: "azure",
          provider_data: %{
            resource_group: "sap-production-rg",
            location: "West Europe",
            vm_size: "Standard_E16s_v3"
          },
          tags: [
            %{
              value: "production",
              resource_id: "9876b7a8-2e1f-4b9a-8e7d-3a4b5c6d7e8f",
              resource_type: "host"
            }
          ],
          sles_subscriptions: [],
          selected_checks: ["check_1", "check_2"],
          saptune_status: %{
            package_version: "3.1.0"
          },
          deregistered_at: "2024-01-15T08:00:00Z",
          last_heartbeat_timestamp: "2024-01-15T12:45:00Z",
          inserted_at: "2024-01-15T09:00:00Z",
          updated_at: "2024-01-15T12:45:00Z"
        }
      },
      struct?: false
    )
  end

  defmodule HostsCollection do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "HostsCollection",
        description: "A list of the discovered hosts.",
        type: :array,
        items: HostItem,
        example: [
          %{
            id: "779cdd70-e9e2-58ca-b18a-bf3eb3f71244",
            hostname: "suse-node1",
            ip_addresses: ["10.1.1.2", "192.168.1.10"],
            agent_version: "1.0.0",
            cluster_id: "6c76eb74-dd68-4c91-b4d1-4f9d91f2c2c8",
            health: "passing",
            selected_checks: [],
            tags: [],
            inserted_at: "2024-01-15T10:30:00Z",
            updated_at: "2024-01-15T12:30:00Z"
          }
        ]
      },
      struct?: false
    )
  end
end
