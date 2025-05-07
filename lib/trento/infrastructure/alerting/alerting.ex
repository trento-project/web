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
  def notify_critical_host_health(host_id) do
    notify_critical_component_health(fn ->
      %HostReadModel{hostname: hostname} = Trento.Repo.get!(HostReadModel, host_id)

      ["Host", "hostname", hostname, "health is now in critical state"]
    end)
  end

  @spec notify_critical_cluster_health(String.t()) :: :ok
  def notify_critical_cluster_health(cluster_id) do
    notify_critical_component_health(fn ->
      %ClusterReadModel{name: name} = Trento.Repo.get!(ClusterReadModel, cluster_id)

      ["Cluster", "name", name, "health is now in critical state"]
    end)
  end

  @spec notify_critical_database_health(String.t()) :: :ok
  def notify_critical_database_health(id) do
    notify_critical_component_health(fn ->
      %DatabaseReadModel{sid: sid} = Trento.Repo.get!(DatabaseReadModel, id)

      ["Database", "SID", sid, "health is now in critical state"]
    end)
  end

  @spec notify_critical_sap_system_health(String.t()) :: :ok
  def notify_critical_sap_system_health(id) do
    notify_critical_component_health(fn ->
      %SapSystemReadModel{sid: sid} = Trento.Repo.get!(SapSystemReadModel, id)

      ["Sap System", "SID", sid, "health is now in critical state"]
    end)
  end

  @spec notify_api_key_expiration() :: :ok
  def notify_api_key_expiration do
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

  defp notify_critical_component_health(component_fetcher) do
    deliver_notification(fn %{sender: sender, recipient: recipient} ->
      [component, identified_by, identifier, reason] = component_fetcher.()

      EmailAlert.alert(
        component,
        identified_by,
        identifier,
        reason,
        sender: sender,
        recipient: recipient
      )
    end)
  end

  defp api_key_expiration_days(%ApiKeySettings{expire_at: expire_at}),
    do: DateTime.diff(expire_at, DateTime.utc_now(), :day)

  defp maybe_send_api_key_notification(days) when days < 0 do
    construct_email = fn %{sender: sender, recipient: recipient} ->
      EmailAlert.api_key_expired(
        sender: sender,
        recipient: recipient
      )
    end

    deliver_notification(construct_email)
  end

  defp maybe_send_api_key_notification(days) when days < 30 do
    construct_email = fn %{sender: sender, recipient: recipient} ->
      EmailAlert.api_key_will_expire(
        days,
        sender: sender,
        recipient: recipient
      )
    end

    deliver_notification(construct_email)
  end

  defp maybe_send_api_key_notification(_), do: :ok

  defp prepare_mailer_config(%{
         smtp_server: server,
         smtp_port: port,
         smtp_username: username,
         smtp_password: password
       }) do
    tls_options =
      Application.get_env(:trento, Trento.Mailer)
      |> Keyword.get(:tls_options, [])
      |> Keyword.put(:server_name_indication, String.to_charlist(server))

    [
      relay: server,
      port: port,
      username: username,
      password: password,
      tls_options: tls_options
    ]
  end

  defp deliver_notification(construct_email) do
    case Settings.get_alerting_settings() do
      {:ok, settings} ->
        deliver_notification(construct_email, settings)

      {:error, :alerting_settings_not_configured} ->
        Logger.warning("Trying to send email but alerting settings are not configured")
        :ok
    end
  end

  defp deliver_notification(_, %{enabled: false}), do: :ok

  defp deliver_notification(
         construct_email,
         %{
           sender_email: sender,
           recipient_email: recipient
         } = alerting_settings
       )
       when is_function(construct_email) do
    %Swoosh.Email{subject: subject} =
      notification = construct_email.(%{sender: sender, recipient: recipient})

    mailer_config = prepare_mailer_config(alerting_settings)

    notification
    |> Mailer.deliver(mailer_config)
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
