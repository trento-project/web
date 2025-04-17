defmodule Trento.Infrastructure.Alerting.Alerting do
  @moduledoc """
  Provides a set of functions of Alerting related usecases.
  """

  import Trento.Settings.AlertingSettings, only: [get_alerting_settings: 0]

  alias Trento.Clusters.Projections.ClusterReadModel
  alias Trento.Hosts.Projections.HostReadModel

  alias Trento.Databases.Projections.DatabaseReadModel
  alias Trento.SapSystems.Projections.SapSystemReadModel

  alias Trento.Infrastructure.Alerting.Emails.EmailAlert
  alias Trento.Mailer
  alias Trento.Settings
  alias Trento.Settings.ApiKeySettings

  require Logger

  @type mailer_settings_t :: %{
          smtp_server: String.t(),
          smtp_port: String.t() | integer,
          smtp_username: String.t(),
          smtp_password: String.t()
        }

  @spec notify_critical_host_health(String.t()) ::
          :ok | {:error, :alerting_settings_not_configured}
  def notify_critical_host_health(host_id) do
    with {:ok, settings} <- get_alerting_settings() do
      maybe_notify_critical_host_health(host_id, settings)
    end
  end

  @spec notify_critical_cluster_health(String.t()) ::
          :ok | {:error, :alerting_settings_not_configured}
  def notify_critical_cluster_health(cluster_id) do
    with {:ok, settings} <- get_alerting_settings() do
      maybe_notify_critical_cluster_health(cluster_id, settings)
    end
  end

  @spec notify_critical_database_health(String.t()) ::
          :ok | {:error, :alerting_settings_not_configured}
  def notify_critical_database_health(id) do
    with {:ok, settings} <- get_alerting_settings() do
      maybe_notify_critical_database_health(id, settings)
    end
  end

  @spec notify_critical_sap_system_health(String.t()) ::
          :ok | {:error, :alerting_settings_not_configured}
  def notify_critical_sap_system_health(id) do
    with {:ok, settings} <- get_alerting_settings() do
      maybe_notify_critical_sap_system_health(id, settings)
    end
  end

  @spec notify_api_key_expiration() ::
          :ok | {:error, :alerting_settings_not_configured}
  def notify_api_key_expiration do
    with {:ok, settings} <- get_alerting_settings() do
      maybe_notify_api_key_expiration(settings)
    end
  end

  defp maybe_notify_critical_host_health(_, %{enabled: false}), do: :ok

  defp maybe_notify_critical_host_health(
         host_id,
         %{sender_email: sender, recipient_email: recipient} = alerting_settings
       ) do
    %HostReadModel{hostname: hostname} = Trento.Repo.get!(HostReadModel, host_id)

    deliver_notification(
      EmailAlert.alert(
        "Host",
        "hostname",
        hostname,
        "health is now in critical state",
        sender: sender,
        recipient: recipient
      ),
      alerting_settings
    )
  end

  defp maybe_notify_critical_cluster_health(_, %{enabled: false}), do: :ok

  defp maybe_notify_critical_cluster_health(
         cluster_id,
         %{sender_email: sender, recipient_email: recipient} = alerting_settings
       ) do
    %ClusterReadModel{name: name} = Trento.Repo.get!(ClusterReadModel, cluster_id)

    deliver_notification(
      EmailAlert.alert(
        "Cluster",
        "name",
        name,
        "health is now in critical state",
        sender: sender,
        recipient: recipient
      ),
      alerting_settings
    )
  end

  defp maybe_notify_critical_database_health(_, %{enabled: false}), do: :ok

  defp maybe_notify_critical_database_health(
         id,
         %{sender_email: sender, recipient_email: recipient} = alerting_settings
       ) do
    %DatabaseReadModel{sid: sid} = Trento.Repo.get!(DatabaseReadModel, id)

    deliver_notification(
      EmailAlert.alert(
        "Database",
        "SID",
        sid,
        "health is now in critical state",
        sender: sender,
        recipient: recipient
      ),
      alerting_settings
    )
  end

  defp maybe_notify_critical_sap_system_health(_, %{enabled: false}), do: :ok

  defp maybe_notify_critical_sap_system_health(
         id,
         %{sender_email: sender, recipient_email: recipient} = alerting_settings
       ) do
    %SapSystemReadModel{sid: sid} = Trento.Repo.get!(SapSystemReadModel, id)

    deliver_notification(
      EmailAlert.alert(
        "Sap System",
        "SID",
        sid,
        "health is now in critical state",
        sender: sender,
        recipient: recipient
      ),
      alerting_settings
    )
  end

  defp maybe_notify_api_key_expiration(%{enabled: false}), do: :ok

  defp maybe_notify_api_key_expiration(alerting_settings) do
    case Settings.get_api_key_settings() do
      {:ok, %ApiKeySettings{expire_at: nil}} ->
        :ok

      {:ok, %ApiKeySettings{} = api_key_settings} ->
        api_key_settings
        |> api_key_expiration_days()
        |> maybe_send_api_key_notification(alerting_settings)

      error ->
        error
    end
  end

  defp api_key_expiration_days(%ApiKeySettings{expire_at: expire_at}),
    do: DateTime.diff(expire_at, DateTime.utc_now(), :day)

  defp maybe_send_api_key_notification(
         days,
         %{sender_email: sender, recipient_email: recipient} = alerting_settings
       )
       when days < 0 do
    deliver_notification(
      EmailAlert.api_key_expired(
        sender: sender,
        recipient: recipient
      ),
      alerting_settings
    )
  end

  defp maybe_send_api_key_notification(
         days,
         %{sender_email: sender, recipient_email: recipient} = alerting_settings
       )
       when days < 30 do
    days
    |> EmailAlert.api_key_will_expire(sender: sender, recipient: recipient)
    |> deliver_notification(alerting_settings)
  end

  defp maybe_send_api_key_notification(_, _), do: :ok

  @spec deliver_notification(Swoosh.Email.t(), mailer_settings_t()) :: :ok
  defp deliver_notification(
         %Swoosh.Email{subject: subject} = notification,
         %{
           smtp_server: server,
           smtp_port: port,
           smtp_username: username,
           smtp_password: password
         }
       ) do
    config = [
      relay: server,
      port: port,
      username: username,
      password: password
    ]

    notification
    |> Mailer.deliver(config)
    |> case do
      {:ok, _} ->
        :ok

      {:error, {:retries_exceeded, {:network_failure, chars, {:error, :nxdomain}}}} ->
        Logger.error("Failed to lookup #{chars} address.")

        :ok

      {:error, reason} ->
        Logger.error(
          "Failed to send alert notification with subject \"#{subject}\": #{inspect(reason)}",
          error: reason
        )

        :ok
    end
  end
end
