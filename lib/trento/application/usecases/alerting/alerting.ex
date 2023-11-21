defmodule Trento.Application.UseCases.Alerting do
  @moduledoc """
  Provides a set of functions of Alerting related usecases.
  """

  alias Trento.ClusterReadModel
  alias Trento.Hosts.Projections.HostReadModel

  alias Trento.SapSystems.Projections.{
    DatabaseReadModel,
    SapSystemReadModel
  }

  alias Trento.Application.UseCases.Alerting.EmailAlert
  alias Trento.Mailer

  require Logger

  @spec notify_critical_host_health(String.t()) :: :ok
  def notify_critical_host_health(host_id),
    do: maybe_notify_critical_host_health(enabled?(), host_id)

  @spec notify_critical_cluster_health(String.t()) :: :ok
  def notify_critical_cluster_health(cluster_id),
    do: maybe_notify_critical_cluster_health(enabled?(), cluster_id)

  @spec notify_critical_database_health(String.t()) :: :ok
  def notify_critical_database_health(id),
    do: maybe_notify_critical_database_health(enabled?(), id)

  @spec notify_critical_sap_system_health(String.t()) :: :ok
  def notify_critical_sap_system_health(id),
    do: maybe_notify_critical_sap_system_health(enabled?(), id)

  defp enabled?, do: Application.fetch_env!(:trento, :alerting)[:enabled]

  defp maybe_notify_critical_host_health(false, _), do: :ok

  defp maybe_notify_critical_host_health(true, host_id) do
    %HostReadModel{hostname: hostname} = Trento.Repo.get!(HostReadModel, host_id)

    deliver_notification(
      EmailAlert.alert("Host", "hostname", hostname, "health is now in critical state")
    )
  end

  defp maybe_notify_critical_cluster_health(false, _), do: :ok

  defp maybe_notify_critical_cluster_health(true, cluster_id) do
    %ClusterReadModel{name: name} = Trento.Repo.get!(ClusterReadModel, cluster_id)

    deliver_notification(
      EmailAlert.alert("Cluster", "name", name, "health is now in critical state")
    )
  end

  defp maybe_notify_critical_database_health(false, _), do: :ok

  defp maybe_notify_critical_database_health(true, id) do
    %DatabaseReadModel{sid: sid} = Trento.Repo.get!(DatabaseReadModel, id)

    deliver_notification(
      EmailAlert.alert("Database", "SID", sid, "health is now in critical state")
    )
  end

  defp maybe_notify_critical_sap_system_health(false, _), do: :ok

  defp maybe_notify_critical_sap_system_health(true, id) do
    %SapSystemReadModel{sid: sid} = Trento.Repo.get!(SapSystemReadModel, id)

    deliver_notification(
      EmailAlert.alert("Sap System", "SID", sid, "health is now in critical state")
    )
  end

  @spec deliver_notification(Swoosh.Email.t()) :: :ok
  defp deliver_notification(%Swoosh.Email{subject: subject} = notification) do
    notification
    |> Mailer.deliver()
    |> case do
      {:ok, _} ->
        :ok

      {:error, reason} ->
        Logger.error("Failed to send alert notification with subject \"#{subject}\": #{reason}",
          error: reason
        )

        :ok
    end
  end
end
