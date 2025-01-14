defmodule Trento.ActivityLog.ActivityLog do
  @moduledoc """
  ActivityLog represents an interesting activity that is tracked
  """
  use Ecto.Schema
  import Ecto.Changeset

  @type t() :: %__MODULE__{}

  @derive {
    Flop.Schema,
    filterable: [:type, :actor, :severity, :inserted_at],
    sortable: [:type, :actor, :inserted_at],
    max_limit: 100,
    default_limit: 25,
    default_order: %{
      order_by: [:inserted_at],
      order_directions: [:desc]
    },
    pagination_types: [:first, :last],
    default_pagination_type: :first
  }

  @primary_key {:id, :binary_id, autogenerate: true}
  schema "activity_logs" do
    field :type, :string
    field :actor, :string
    field :metadata, :map
    field :severity, :integer, default: 9

    timestamps(type: :utc_datetime_usec)
  end

  @severity_min 1
  @severity_max 24
  def changeset(activity_log, attrs) do
    activity_log
    |> cast(attrs, __MODULE__.__schema__(:fields))
    |> validate_required([:type, :actor, :metadata, :severity])
    |> put_change(:severity, map_severity_level(attrs.type, attrs.metadata))
    |> validate_inclusion(:severity, @severity_min..@severity_max)
  end

  def severity_level_to_integer(:debug), do: 5
  def severity_level_to_integer(:info), do: 9
  def severity_level_to_integer(:warning), do: 13
  def severity_level_to_integer(:error), do: 17
  def severity_level_to_integer(:critical), do: 21

  @severity_level_mapping %{
    "login_attempt" => %{type: :key, key: :reason, condition: :key_exists},
    "user_creation" => :info,
    "user_modification" => :info,
    "user_deletion" => :warning,
    "profile_update" => :info,
    "resource_tagging" => :info,
    "resource_untagging" => :info,
    "api_key_generation" => :info,
    "saving_suma_settings" => :info,
    "changing_suma_settings" => :info,
    "clearing_suma_settings" => :warning,
    "cluster_checks_execution_request" => :info,
    "activity_log_settings_update" => :debug,
    "heartbeat_succeeded" => :debug,
    "heartbeat_failed" => :warning,
    "host_checks_health_changed" => %{
      type: :kv,
      key_suffix: "health",
      values: %{"critical" => :critical, "unknown" => :warning, "*" => :info},
      condition: :map_value_to_severity
    },
    "host_checks_selected" => :info,
    "host_checks_execution_request" => :info,
    "host_deregistered" => :warning,
    "host_deregistration_requested" => :debug,
    "host_details_updated" => :info,
    "host_health_changed" => :info,
    "host_registered" => :info,
    "host_restored" => :info,
    "host_rolled_up" => :debug,
    "host_rollup_requested" => :debug,
    "host_saptune_health_changed" => %{
      type: :kv,
      key_suffix: "health",
      values: %{"critical" => :critical, "unknown" => :warning, "*" => :info},
      condition: :map_value_to_severity
    },
    "host_tombstoned" => :debug,
    "provider_updated" => :debug,
    "saptune_status_updated" => :info,
    "sles_subscriptions_updated" => :debug,
    "software_updates_discovery_cleared" => :debug,
    "software_updates_discovery_requested" => :debug,
    "software_updates_health_changed" => %{
      type: :kv,
      key_suffix: "health",
      values: %{"critical" => :critical, "unknown" => :warning, "*" => :info},
      condition: :map_value_to_severity
    },
    "checks_selected" => :warning,
    "cluster_checks_health_changed" => %{
      type: :kv,
      key_suffix: "health",
      values: %{"critical" => :critical, "unknown" => :warning, "*" => :info},
      condition: :map_value_to_severity
    },
    "cluster_deregistered" => :warning,
    "cluster_details_updated" => :debug,
    "cluster_discovered_health_changed" => %{
      type: :kv,
      key_suffix: "health",
      values: %{"critical" => :critical, "unknown" => :warning, "*" => :info},
      condition: :map_value_to_severity
    },
    "cluster_health_changed" => %{
      type: :kv,
      key_suffix: "health",
      values: %{"critical" => :critical, "unknown" => :warning, "*" => :info},
      condition: :map_value_to_severity
    },
    "cluster_registered" => :info,
    "cluster_restored" => :info,
    "cluster_rolled_up" => :debug,
    "cluster_rollup_requested" => :debug,
    "cluster_tombstoned" => :debug,
    "host_added_to_cluster" => :debug,
    "host_removed_from_cluster" => :debug,
    "application_instance_deregistered" => :warning,
    "application_instance_health_changed" => %{
      type: :kv,
      key_suffix: "health",
      values: %{"critical" => :critical, "unknown" => :warning, "*" => :info},
      condition: :map_value_to_severity
    },
    "application_instance_marked_absent" => :warning,
    "application_instance_marked_present" => :info,
    "application_instance_moved" => :info,
    "application_instance_registered" => :info,
    "sap_system_database_health_changed" => %{
      type: :kv,
      key_suffix: "health",
      values: %{"critical" => :critical, "unknown" => :warning, "*" => :info},
      condition: :map_value_to_severity
    },
    "sap_system_deregistered" => :warning,
    "sap_system_restored" => :debug,
    "sap_system_rolled_up" => :debug,
    "sap_system_rollup_requested" => :debug,
    "sap_system_tombstoned" => :debug,
    "sap_system_updated" => :info,
    "database_deregistered" => :warning,
    "database_health_changed" => :info,
    "database_instance_deregistered" => :warning,
    "database_instance_health_changed" => :info,
    "database_instance_marked_absent" => :warning,
    "database_instance_marked_present" => :info,
    "database_instance_registered" => :info,
    "database_instance_system_replication_changed" => %{
      type: :kv,
      key_suffix: "health",
      values: %{"critical" => :critical, "unknown" => :warning, "*" => :info},
      condition: :map_value_to_severity
    },
    "database_registered" => :info,
    "database_restored" => :info,
    "database_rolled_up" => :debug,
    "database_rollup_requested" => :info,
    "database_tenants_updated" => :info,
    "database_tombstoned" => :debug
  }
  defp map_severity_level(activity_type, metadata) do
    case @severity_level_mapping[activity_type] do
      level when is_atom(level) ->
        severity_level_to_integer(level)

      condition when is_map(condition) ->
        condition |> map_metadata_to_severity_level(metadata) |> severity_level_to_integer()
    end
  end

  defp map_metadata_to_severity_level(mapping, metadata) do
    keys = Map.keys(metadata)
    condition = mapping.condition

    case condition do
      :map_value_to_severity ->
        health_key_suffix = mapping.key_suffix

        health_key =
          keys
          |> Enum.map(&Atom.to_string/1)
          |> Enum.find(fn e -> String.ends_with?(e, health_key_suffix) end)

        health_value = metadata[String.to_existing_atom(health_key)]
        health_value_downcased = health_value |> Atom.to_string() |> String.downcase()
        severity_default = Map.get(mapping.values, "*")
        Map.get(mapping.values, health_value_downcased, severity_default)

      :key_exists ->
        key = mapping.key

        case key in keys do
          true ->
            :warning

          false ->
            :info
        end
    end
  end
end
