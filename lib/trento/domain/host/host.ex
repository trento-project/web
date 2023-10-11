defmodule Trento.Domain.Host do
  @moduledoc """
  The host aggregate manages all the domain logic related to individual hosts
  (agent, in other term) that compose the target infrastructure running SAP systems.

  Each host running a Trento agent is registered as a new aggregate entry.
  New host discovery messages update the aggregate values if there is some difference.
  The host aggregate stores information such as:

  - Host basic information as the hostname and ip addresses
  - Hardware specifications
  - Platform where the host is running (the cloud provider for instance)
  - Registered SLES4SAP subscriptions

  Besides these mostly static values, the aggregate takes care of handling
  heartbeats, checks execution result, saptune status

  ## Host health

  Holds the information about whether the host is in an expected state or not, and if not,
  what is the roout cause helping identifying possible remediation.
  It is composed by sub-health elements:

  - Heartbeat status
  - Checks health

  The main host health is computed using these values, meaning the host health is the worst of the two.

  ### Heartbeat

  Each host in the targe SAP infrastructure running a Trento agent sends a heartbeat message and
  if a heartbeat is not received within a 10 seconds period (configurable),
  a heartbeat failure event is raised changing the health of the host as critical.

  ### Checks health

  The checks health is obtained from the [Checks Engine executions](https://github.com/trento-project/wanda/).
  Every time a checks execution for a host completes the execution's result is taken into account to determine host's health.
  Checks execution is started either by an explicit user request or periodically as per the scheduler configuration.
  """

  require Trento.Domain.Enums.Provider, as: Provider
  require Trento.Domain.Enums.Health, as: Health

  alias Commanded.Aggregate.Multi

  alias Trento.Domain.Host

  alias Trento.Domain.{
    AwsProvider,
    AzureProvider,
    GcpProvider,
    HealthService,
    SaptuneStatus,
    SlesSubscription
  }

  alias Trento.Domain.Commands.{
    CompleteHostChecksExecution,
    DeregisterHost,
    RegisterHost,
    RequestHostDeregistration,
    RollUpHost,
    SelectHostChecks,
    UpdateHeartbeat,
    UpdateProvider,
    UpdateSaptuneStatus,
    UpdateSlesSubscriptions
  }

  alias Trento.Domain.Events.{
    HeartbeatFailed,
    HeartbeatSucceded,
    HostChecksHealthChanged,
    HostChecksSelected,
    HostDeregistered,
    HostDeregistrationRequested,
    HostDetailsUpdated,
    HostHealthChanged,
    HostRegistered,
    HostRestored,
    HostRolledUp,
    HostRollUpRequested,
    HostSaptuneHealthChanged,
    HostTombstoned,
    ProviderUpdated,
    SaptuneStatusUpdated,
    SlesSubscriptionsUpdated
  }

  @required_fields []

  use Trento.Type

  import PolymorphicEmbed, only: [cast_polymorphic_embed: 3]

  deftype do
    field :host_id, Ecto.UUID
    field :hostname, :string
    field :ip_addresses, {:array, :string}
    field :agent_version, :string
    field :cpu_count, :integer
    field :total_memory_mb, :integer
    field :socket_count, :integer
    field :os_version, :string
    field :provider, Ecto.Enum, values: Provider.values()
    field :installation_source, Ecto.Enum, values: [:community, :suse, :unknown]
    field :heartbeat, Ecto.Enum, values: [:passing, :critical, :unknown]
    field :checks_health, Ecto.Enum, values: Health.values(), default: Health.unknown()
    field :saptune_health, Ecto.Enum, values: Health.values(), default: Health.unknown()
    field :health, Ecto.Enum, values: Health.values(), default: Health.unknown()
    field :rolling_up, :boolean, default: false
    field :selected_checks, {:array, :string}, default: []
    field :deregistered_at, :utc_datetime_usec, default: nil

    embeds_one :saptune_status, SaptuneStatus
    embeds_many :subscriptions, SlesSubscription

    field :provider_data, PolymorphicEmbed,
      types: [
        azure: [module: AzureProvider, identify_by_fields: [:resource_group]],
        aws: [module: AwsProvider, identify_by_fields: [:ami_id]],
        gcp: [module: GcpProvider, identify_by_fields: [:project_id]]
      ],
      on_replace: :update
  end

  # Stop everything during the rollup process
  def execute(%Host{rolling_up: true}, _), do: {:error, :host_rolling_up}

  # New host registered
  def execute(
        %Host{host_id: nil},
        %RegisterHost{
          host_id: host_id,
          hostname: hostname,
          ip_addresses: ip_addresses,
          agent_version: agent_version,
          cpu_count: cpu_count,
          total_memory_mb: total_memory_mb,
          socket_count: socket_count,
          os_version: os_version,
          installation_source: installation_source
        }
      ) do
    %HostRegistered{
      host_id: host_id,
      hostname: hostname,
      ip_addresses: ip_addresses,
      agent_version: agent_version,
      cpu_count: cpu_count,
      total_memory_mb: total_memory_mb,
      socket_count: socket_count,
      os_version: os_version,
      installation_source: installation_source,
      heartbeat: :unknown
    }
  end

  # Reject all the commands, except for the registration ones when the host_id does not exists
  def execute(
        %Host{host_id: nil},
        _
      ) do
    {:error, :host_not_registered}
  end

  # Restore the host when a RegisterHost command is received for a deregistered host
  def execute(
        %Host{
          host_id: host_id,
          hostname: hostname,
          ip_addresses: ip_addresses,
          agent_version: agent_version,
          cpu_count: cpu_count,
          total_memory_mb: total_memory_mb,
          socket_count: socket_count,
          os_version: os_version,
          installation_source: installation_source,
          deregistered_at: deregistered_at
        },
        %RegisterHost{
          hostname: hostname,
          ip_addresses: ip_addresses,
          agent_version: agent_version,
          cpu_count: cpu_count,
          total_memory_mb: total_memory_mb,
          socket_count: socket_count,
          os_version: os_version,
          installation_source: installation_source
        }
      )
      when not is_nil(deregistered_at) do
    %HostRestored{
      host_id: host_id
    }
  end

  def execute(
        %Host{
          host_id: host_id,
          deregistered_at: deregistered_at
        },
        %RegisterHost{
          hostname: hostname,
          ip_addresses: ip_addresses,
          agent_version: agent_version,
          cpu_count: cpu_count,
          total_memory_mb: total_memory_mb,
          socket_count: socket_count,
          os_version: os_version,
          installation_source: installation_source
        }
      )
      when not is_nil(deregistered_at) do
    [
      %HostRestored{
        host_id: host_id
      },
      %HostDetailsUpdated{
        host_id: host_id,
        hostname: hostname,
        ip_addresses: ip_addresses,
        agent_version: agent_version,
        cpu_count: cpu_count,
        total_memory_mb: total_memory_mb,
        socket_count: socket_count,
        os_version: os_version,
        installation_source: installation_source
      }
    ]
  end

  def execute(
        %Host{host_id: host_id} = snapshot,
        %RollUpHost{}
      ) do
    %HostRollUpRequested{
      host_id: host_id,
      snapshot: snapshot
    }
  end

  def execute(
        %Host{deregistered_at: deregistered_at},
        _
      )
      when not is_nil(deregistered_at) do
    {:error, :host_not_registered}
  end

  # Host exists but details didn't change
  def execute(
        %Host{
          hostname: hostname,
          ip_addresses: ip_addresses,
          agent_version: agent_version,
          cpu_count: cpu_count,
          total_memory_mb: total_memory_mb,
          socket_count: socket_count,
          os_version: os_version,
          installation_source: installation_source
        },
        %RegisterHost{
          hostname: hostname,
          ip_addresses: ip_addresses,
          agent_version: agent_version,
          cpu_count: cpu_count,
          total_memory_mb: total_memory_mb,
          socket_count: socket_count,
          os_version: os_version,
          installation_source: installation_source
        }
      ) do
    []
  end

  def execute(
        %Host{},
        %RegisterHost{
          host_id: host_id,
          hostname: hostname,
          ip_addresses: ip_addresses,
          agent_version: agent_version,
          cpu_count: cpu_count,
          total_memory_mb: total_memory_mb,
          socket_count: socket_count,
          os_version: os_version,
          installation_source: installation_source
        }
      ) do
    %HostDetailsUpdated{
      host_id: host_id,
      hostname: hostname,
      ip_addresses: ip_addresses,
      agent_version: agent_version,
      cpu_count: cpu_count,
      total_memory_mb: total_memory_mb,
      socket_count: socket_count,
      os_version: os_version,
      installation_source: installation_source
    }
  end

  def execute(
        %Host{heartbeat: heartbeat} = host,
        %UpdateHeartbeat{heartbeat: :passing}
      )
      when heartbeat != :passing do
    host
    |> Multi.new()
    |> Multi.execute(&%HeartbeatSucceded{host_id: &1.host_id})
    |> Multi.execute(&maybe_emit_host_health_changed_event/1)
  end

  def execute(
        %Host{heartbeat: heartbeat} = host,
        %UpdateHeartbeat{heartbeat: :critical}
      )
      when heartbeat != :critical do
    host
    |> Multi.new()
    |> Multi.execute(&%HeartbeatFailed{host_id: &1.host_id})
    |> Multi.execute(&maybe_emit_host_health_changed_event/1)
  end

  def execute(
        %Host{},
        %UpdateHeartbeat{}
      ) do
    []
  end

  def execute(
        %Host{provider: provider, provider_data: provider_data},
        %UpdateProvider{provider: provider, provider_data: provider_data}
      ) do
    []
  end

  def execute(
        %Host{},
        %UpdateProvider{host_id: host_id, provider: provider, provider_data: provider_data}
      ) do
    %ProviderUpdated{
      host_id: host_id,
      provider: provider,
      provider_data: provider_data
    }
  end

  def execute(%Host{subscriptions: subscriptions}, %UpdateSlesSubscriptions{
        subscriptions: subscriptions
      }) do
    []
  end

  def execute(%Host{}, %UpdateSlesSubscriptions{
        host_id: host_id,
        subscriptions: subscriptions
      }) do
    %SlesSubscriptionsUpdated{
      host_id: host_id,
      subscriptions: subscriptions
    }
  end

  def execute(
        %Host{host_id: host_id},
        %RequestHostDeregistration{requested_at: requested_at}
      ) do
    %HostDeregistrationRequested{
      host_id: host_id,
      requested_at: requested_at
    }
  end

  def execute(
        %Host{host_id: host_id},
        %DeregisterHost{deregistered_at: deregistered_at}
      ) do
    [
      %HostDeregistered{
        host_id: host_id,
        deregistered_at: deregistered_at
      },
      %HostTombstoned{
        host_id: host_id
      }
    ]
  end

  def execute(
        %Host{} = host,
        %SelectHostChecks{
          checks: selected_checks
        }
      ) do
    host
    |> Multi.new()
    |> Multi.execute(
      &%HostChecksSelected{
        host_id: &1.host_id,
        checks: selected_checks
      }
    )
    |> Multi.execute(&maybe_emit_host_health_changed_event/1)
  end

  def execute(
        %Host{
          host_id: host_id
        } = host,
        %CompleteHostChecksExecution{
          host_id: host_id,
          health: checks_health
        }
      ) do
    host
    |> Multi.new()
    |> Multi.execute(&maybe_emit_host_checks_health_changed_event(&1, checks_health))
    |> Multi.execute(&maybe_emit_host_health_changed_event/1)
  end

  def execute(
        %Host{
          saptune_status:
            %{
              package_version: package_version
            } = host
        },
        %UpdateSaptuneStatus{
          saptune_installed: true,
          package_version: package_version,
          sap_running: sap_running,
          status: nil
        }
      ) do
    host
    |> Multi.new()
    |> Multi.execute(&maybe_emit_host_saptune_health_changed_event(&1, sap_running))
    |> Multi.execute(&maybe_emit_host_health_changed_event/1)
  end

  def execute(
        %Host{} = host,
        %UpdateSaptuneStatus{
          host_id: host_id,
          saptune_installed: true,
          package_version: package_version,
          sap_running: sap_running,
          status: nil
        }
      ) do
    host
    |> Multi.new()
    |> Multi.execute(fn _ ->
      %SaptuneStatusUpdated{
        host_id: host_id,
        status: %SaptuneStatus{
          package_version: package_version
        }
      }
    end)
    |> Multi.execute(&maybe_emit_host_saptune_health_changed_event(&1, sap_running))
    |> Multi.execute(&maybe_emit_host_health_changed_event/1)
  end

  def execute(
        %Host{
          saptune_status: status
        } = host,
        %UpdateSaptuneStatus{
          status: status,
          sap_running: sap_running
        }
      ) do
    host
    |> Multi.new()
    |> Multi.execute(&maybe_emit_host_saptune_health_changed_event(&1, sap_running))
    |> Multi.execute(&maybe_emit_host_health_changed_event/1)
  end

  def execute(
        %Host{} = host,
        %UpdateSaptuneStatus{
          host_id: host_id,
          sap_running: sap_running,
          status: status
        }
      ) do
    host
    |> Multi.new()
    |> Multi.execute(fn _ ->
      %SaptuneStatusUpdated{
        host_id: host_id,
        status: status
      }
    end)
    |> Multi.execute(&maybe_emit_host_saptune_health_changed_event(&1, sap_running))
    |> Multi.execute(&maybe_emit_host_health_changed_event/1)
  end

  def apply(
        %Host{} = host,
        %HostRegistered{
          host_id: host_id,
          hostname: hostname,
          ip_addresses: ip_addresses,
          agent_version: agent_version,
          cpu_count: cpu_count,
          total_memory_mb: total_memory_mb,
          socket_count: socket_count,
          os_version: os_version,
          installation_source: installation_source,
          heartbeat: heartbeat
        }
      ) do
    %Host{
      host
      | host_id: host_id,
        hostname: hostname,
        ip_addresses: ip_addresses,
        agent_version: agent_version,
        cpu_count: cpu_count,
        total_memory_mb: total_memory_mb,
        socket_count: socket_count,
        os_version: os_version,
        installation_source: installation_source,
        heartbeat: heartbeat
    }
  end

  def apply(
        %Host{} = host,
        %HostDetailsUpdated{
          hostname: hostname,
          ip_addresses: ip_addresses,
          agent_version: agent_version,
          cpu_count: cpu_count,
          total_memory_mb: total_memory_mb,
          socket_count: socket_count,
          os_version: os_version,
          installation_source: installation_source
        }
      ) do
    %Host{
      host
      | hostname: hostname,
        ip_addresses: ip_addresses,
        agent_version: agent_version,
        cpu_count: cpu_count,
        total_memory_mb: total_memory_mb,
        socket_count: socket_count,
        os_version: os_version,
        installation_source: installation_source
    }
  end

  def apply(
        %Host{} = host,
        %HeartbeatSucceded{host_id: host_id}
      ) do
    %Host{
      host
      | host_id: host_id,
        heartbeat: :passing
    }
  end

  def apply(
        %Host{} = host,
        %HeartbeatFailed{host_id: host_id}
      ) do
    %Host{
      host
      | host_id: host_id,
        heartbeat: :critical
    }
  end

  def apply(
        %Host{} = host,
        %ProviderUpdated{provider: provider, provider_data: provider_data}
      ) do
    %Host{
      host
      | provider: provider,
        provider_data: provider_data
    }
  end

  def apply(%Host{} = host, %SlesSubscriptionsUpdated{
        subscriptions: subscriptions
      }) do
    %Host{host | subscriptions: subscriptions}
  end

  # Aggregate to rolling up state
  def apply(%Host{} = host, %HostRollUpRequested{}) do
    %Host{host | rolling_up: true}
  end

  # Hydrate the aggregate with a rollup snapshot after rollup ends
  def apply(%Host{}, %HostRolledUp{
        snapshot: snapshot
      }) do
    snapshot
  end

  def apply(
        %Host{} = host,
        %HostChecksSelected{
          checks: selected_checks
        }
      ) do
    %Host{
      host
      | selected_checks: selected_checks
    }
  end

  def apply(%Host{} = host, %HostChecksHealthChanged{
        checks_health: checks_health
      }),
      do: %Host{
        host
        | checks_health: checks_health
      }

  def apply(%Host{} = host, %HostSaptuneHealthChanged{
        saptune_health: checks_health
      }),
      do: %Host{
        host
        | saptune_health: checks_health
      }

  def apply(
        %Host{} = host,
        %SaptuneStatusUpdated{
          status: status
        }
      ) do
    %Host{
      host
      | saptune_status: status
    }
  end

  def apply(%Host{} = host, %HostHealthChanged{health: health}) do
    %Host{host | health: health}
  end

  # Deregistration

  def apply(%Host{} = host, %HostDeregistered{
        deregistered_at: deregistered_at
      }) do
    %Host{host | deregistered_at: deregistered_at}
  end

  def apply(%Host{} = host, %HostDeregistrationRequested{}), do: host
  def apply(%Host{} = host, %HostTombstoned{}), do: host

  # Restoration
  def apply(%Host{} = host, %HostRestored{}) do
    %Host{host | deregistered_at: nil}
  end

  defp maybe_emit_host_checks_health_changed_event(
         %Host{checks_health: checks_health},
         checks_health
       ),
       do: nil

  defp maybe_emit_host_checks_health_changed_event(
         %Host{host_id: host_id},
         checks_health
       ),
       do: %HostChecksHealthChanged{
         host_id: host_id,
         checks_health: checks_health
       }

  defp maybe_emit_host_saptune_health_changed_event(
         %Host{host_id: host_id, saptune_health: saptune_health},
         false
       )
       when saptune_health != Health.passing(),
       do: %HostSaptuneHealthChanged{
         host_id: host_id,
         saptune_health: Health.passing()
       }

  defp maybe_emit_host_saptune_health_changed_event(
         _,
         false
       ),
       do: nil

  defp maybe_emit_host_saptune_health_changed_event(
         %Host{host_id: host_id, saptune_status: saptune_status, saptune_health: saptune_health},
         true
       ) do
    new_saptune_health = compute_saptune_health(saptune_status)

    if saptune_health != new_saptune_health do
      %HostSaptuneHealthChanged{
        host_id: host_id,
        saptune_health: new_saptune_health
      }
    end
  end

  defp compute_saptune_health(nil), do: Health.warning()

  defp compute_saptune_health(%{package_version: package_version, tuning_state: tuning_state}) do
    if Version.compare(package_version, "3.1.0") == :lt do
      Health.warning()
    else
      compute_tuning_health(tuning_state)
    end
  end

  defp compute_tuning_health("not compliant"), do: Health.critical()
  defp compute_tuning_health("not tuned"), do: Health.warning()
  defp compute_tuning_health("compliant"), do: Health.passing()
  defp compute_tuning_health(_), do: Health.unknown()

  defp maybe_emit_host_health_changed_event(%Host{
         host_id: host_id,
         selected_checks: selected_checks,
         heartbeat: heartbeat,
         checks_health: checks_health,
         saptune_health: saptune_health,
         health: current_health
       }) do
    new_health =
      [heartbeat]
      |> maybe_add_checks_health(checks_health, selected_checks)
      |> maybe_add_saptune_health(saptune_health)
      |> Enum.filter(& &1)
      |> HealthService.compute_aggregated_health()

    if new_health != current_health do
      %HostHealthChanged{host_id: host_id, health: new_health}
    end
  end

  defp maybe_add_checks_health(healths, _, []), do: healths
  defp maybe_add_checks_health(healths, checks_health, _), do: [checks_health | healths]

  defp maybe_add_saptune_health(healths, Health.unknown()), do: healths
  defp maybe_add_saptune_health(healths, saptune_health), do: [saptune_health | healths]
end
