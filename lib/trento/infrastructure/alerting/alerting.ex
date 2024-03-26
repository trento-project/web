defmodule Trento.Infrastructure.Alerting.Alerting do
  @moduledoc """
  Provides a set of functions of Alerting related usecases.
  """

  alias Trento.Clusters.Projections.ClusterReadModel
  alias Trento.Hosts.Projections.HostReadModel

  alias Trento.Databases.Projections.DatabaseReadModel
  alias Trento.SapSystems.Projections.SapSystemReadModel

  alias Trento.Infrastructure.Alerting.Emails.EmailAlert
  alias Trento.Mailer
  alias Trento.Settings
  alias Trento.Settings.ApiKeySettings

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

  @spec notify_api_key_expiration() :: :ok
  def notify_api_key_expiration, do: maybe_notify_api_key_expiration(enabled?())

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

  defp maybe_notify_api_key_expiration(false), do: :ok

  defp maybe_notify_api_key_expiration(true) do
    case Settings.get_api_key_settings() do
      {:ok, %ApiKeySettings{expire_at: nil}} ->
        :ok

      {:ok, %ApiKeySettings{} = api_key_settings} ->
        api_key_settings
        |> api_key_expiration_days()
        |> maybe_send_api_key_notification()

      error ->
        error
    end
  end

  defp api_key_expiration_days(%ApiKeySettings{expire_at: expire_at}),
    do: DateTime.diff(expire_at, DateTime.utc_now(), :day)

  defp maybe_send_api_key_notification(days) when days < 0 do
    deliver_notification(EmailAlert.api_key_expired())
  end

  defp maybe_send_api_key_notification(days) when days < 30 do
    days
    |> EmailAlert.api_key_will_expire()
    |> deliver_notification()
  end

  defp maybe_send_api_key_notification(_), do: :ok

  @spec deliver_notification(Swoosh.Email.t()) :: :ok
  defp deliver_notification(%Swoosh.Email{subject: subject} = notification) do
    notification
    |> Mailer.deliver()
    |> case do
      {:ok, _} ->
        :ok

      {:error, {:retries_exceeded, {:network_failure, chars, {:error, :nxdomain}}}} ->
        Logger.error("Failed to lookup #{chars} address.")

        :ok

      {:error, reason} ->
        Logger.error("Failed to send alert notification with subject \"#{subject}\": #{reason}",
          error: reason
        )

        :ok
    end
  end
end
