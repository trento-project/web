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

  defp map_severity_level(activity_type, metadata) do
    level =
      case {activity_type, metadata} do
        {"login_attempt", %{"reason" => _}} ->
          :warning

        {"login_attempt", %{}} ->
          :info

        {"user_creation", _} ->
          :info

        {"user_modification", _} ->
          :info

        {"user_deletion", _} ->
          :warning

        {"profile_update", _} ->
          :info

        {"resource_tagging", %{resource_type: _resource_type}} ->
          :info

        {"resource_untagging", _} ->
          :info

        {"api_key_generation", _} ->
          :info

        {"saving_suma_settings", _} ->
          :info

        {"changing_suma_settings", _} ->
          :info

        {"clearing_suma_settings", _} ->
          :warning

        {"cluster_checks_execution_request", _} ->
          :info

        {"activity_log_settings_update", _} ->
          :debug

        {"heartbeat_succeeded", _} ->
          :debug

        {"heartbeat_failed", _} ->
          :warning

        {"host_checks_health_changed", %{"health" => health}} ->
          map_health_to_severity_level(health)

        {"host_checks_selected", _} ->
          :info

        {"host_deregistered", _} ->
          :warning

        {"host_deregistration_requested", _} ->
          :debug

        {"host_details_updated", _} ->
          :info

        {"host_health_changed", _} ->
          :info

        {"host_registered", _} ->
          :info

        {"host_restored", _} ->
          :info

        {"host_rolled_up", _} ->
          :debug

        {"host_rollup_requested", _} ->
          :debug

        {"host_saptune_health_changed", %{"health" => health}} ->
          map_health_to_severity_level(health)

        {"host_tombstoned", _} ->
          :debug

        {"provider_updated", _} ->
          :debug

        {"saptune_status_updated", _} ->
          :info

        {"sles_subscriptions_updated", _} ->
          :debug

        {"software_updates_discovery_cleared", _} ->
          :debug

        {"software_updates_discovery_requested", _} ->
          :debug

        {"software_updates_health_changed", %{"health" => health}} ->
          map_health_to_severity_level(health)

        {"checks_selected", _} ->
          :warning

        {"cluster_checks_health_changed", %{"health" => health}} ->
          map_health_to_severity_level(health)

        {"cluster_deregistered", _} ->
          :warning

        {"cluster_details_updated", _} ->
          :debug

        {"cluster_discovered_health_changed", %{"health" => health}} ->
          map_health_to_severity_level(health)

        {"cluster_health_changed", %{"health" => health}} ->
          map_health_to_severity_level(health)

        {"cluster_registered", _} ->
          :info

        {"cluster_restored", _} ->
          :info

        {"cluster_rolled_up", _} ->
          :debug

        {"cluster_rollup_requested", _} ->
          :debug

        {"cluster_tombstoned", _} ->
          :debug

        {"host_added_to_cluster", _} ->
          :debug

        {"host_removed_from_cluster", _} ->
          :debug

        {"application_instance_deregistered", _} ->
          :warning

        {"application_instance_health_changed", %{"health" => health}} ->
          map_health_to_severity_level(health)

        {"application_instance_marked_absent", _} ->
          :warning

        {"application_instance_marked_present", _} ->
          :info

        {"application_instance_moved", _} ->
          :info

        {"application_instance_registered", _} ->
          :info

        {"sap_system_database_health_changed", %{"health" => health}} ->
          map_health_to_severity_level(health)

        {"sap_system_deregistered", _} ->
          :warning

        {"sap_system_restored", _} ->
          :info

        {"sap_system_rolled_up", _} ->
          :debug

        {"sap_system_rollup_requested", _} ->
          :debug

        {"sap_system_tombstoned", _} ->
          :debug

        {"sap_system_updated", _} ->
          :info

        {"database_deregistered", _} ->
          :warning

        #
        {"database_health_changed", _} ->
          :info

        {"database_instance_deregistered", _} ->
          :warning

        # 
        {"database_instance_health_changed", _} ->
          :info

        {"database_instance_marked_absent", _} ->
          :warning

        {"database_instance_marked_present", _} ->
          :info

        {"database_instance_registered", _} ->
          :info

        {"database_instance_system_replication_changed", %{"health" => health}} ->
          map_health_to_severity_level(health)

        {"database_registered", _} ->
          :info

        {"database_restored", _} ->
          :info

        {"database_rolled_up", _} ->
          :debug

        {"database_rollup_requested", _} ->
          :info

        {"database_tenants_updated", _} ->
          :info

        {"database_tombstoned", _} ->
          :debug

        _ ->
          :warning
      end

    severity_level_to_integer(level)
  end

  defp map_health_to_severity_level("critical"), do: :critical
  defp map_health_to_severity_level(""), do: :warning
  defp map_health_to_severity_level(_), do: :info
end
