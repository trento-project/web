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
        description:
          "Represents the format of an IPv4 address, used for network identification and communication in the host system.",
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
        description:
          "Represents the format of an IPv6 address, supporting modern network identification and communication in the host system.",
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
        description:
          "Provides information about a systemd service unit, including its name and operational state for system management.",
        type: :object,
        additionalProperties: false,
        properties: %{
          name: %Schema{
            type: :string,
            description:
              "The name assigned to the systemd unit, used for identification and management."
          },
          unit_file_state: %Schema{
            type: :string,
            description:
              "Shows the current state of the systemd unit, such as enabled or disabled, supporting operational management."
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
        description:
          "Represents a discovered host on the target infrastructure, including its configuration, health, and associated resources.",
        type: :object,
        additionalProperties: false,
        properties: %{
          id: %Schema{
            type: :string,
            description: "Unique identifier for the host, used for tracking and management.",
            format: :uuid
          },
          hostname: %Schema{
            type: :string,
            description:
              "The name assigned to the host, used for identification and organization."
          },
          ip_addresses: %Schema{
            type: :array,
            description:
              "A list of IP addresses assigned to the host, supporting network identification and communication.",
            items: %Schema{
              description:
                "Represents an IP address for the host, which may be either IPv4 or IPv6, supporting network connectivity.",
              anyOf: [
                IPv4,
                IPv6
              ]
            }
          },
          netmasks: %Schema{
            type: :array,
            description:
              "A list of netmasks associated with the host's IP addresses, where each netmask corresponds to the position of the IP address in the list.",
            items: %Schema{type: :integer, nullable: true}
          },
          agent_version: %Schema{
            type: :string,
            description:
              "Shows the version of the agent software installed on the host, supporting compatibility and management."
          },
          systemd_units: %Schema{
            description:
              "A list containing all systemd units present on the host, supporting service management and monitoring.",
            type: :array,
            items: SystemdUnit
          },
          arch: HostArchitecture,
          health: ResourceHealth,
          cluster_id: %Schema{
            type: :string,
            description:
              "Unique identifier of the cluster to which this host belongs, supporting infrastructure management.",
            format: :uuid,
            nullable: true
          },
          cluster_host_status: %Schema{
            type: :string,
            description:
              "Shows the current status of the host within its cluster, supporting operational monitoring and management.",
            enum: ClusterHostStatus.values(),
            nullable: true
          },
          heartbeat: %Schema{
            type: :string,
            description:
              "Indicates the last heartbeat status received from the host, supporting health monitoring and alerting.",
            enum: [:critical, :passing, :unknown]
          },
          provider: Provider.SupportedProviders,
          provider_data: Provider.ProviderData,
          tags: Tags,
          sles_subscriptions: %Schema{
            description:
              "A list containing all available SLES subscriptions on the host, supporting license management and compliance.",
            type: :array,
            items: SlesSubscription
          },
          selected_checks: %Schema{
            description:
              "A list containing the IDs of checks selected for execution on this host, supporting targeted monitoring and analysis.",
            type: :array,
            items: %Schema{type: :string}
          },
          saptune_status: SaptuneStatus,
          deregistered_at: %Schema{
            description:
              "The timestamp indicating when the host was last deregistered, supporting audit and lifecycle management.",
            type: :string,
            nullable: true,
            format: :"date-time"
          },
          last_heartbeat_timestamp: %Schema{
            description:
              "The timestamp of the last heartbeat received from the host, supporting health monitoring and alerting.",
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
        description:
          "A list containing all discovered hosts on the target infrastructure, supporting monitoring and management.",
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
