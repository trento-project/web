defmodule Trento.Application.UseCases.Alerting do
  @moduledoc """
  Provides a set of functions of Alerting related usecases.
  """

  alias Trento.{
    ClusterReadModel,
    DatabaseReadModel,
    HostReadModel,
    SapSystemReadModel
  }

  alias Trento.Application.UseCases.Alerting.EmailAlert
  alias Trento.Mailer

  require Logger

  @spec notify_heartbeat_failed(String.t()) :: :ok
  def notify_heartbeat_failed(host_id) do
    %HostReadModel{hostname: hostname} = Trento.Repo.get!(HostReadModel, host_id)

    EmailAlert.alert("Host", "hostname", hostname, "heartbeat failed")
    |> deliver_notification()
  end

  @spec notify_critical_cluster_health(String.t()) :: :ok
  def notify_critical_cluster_health(cluster_id) do
    %ClusterReadModel{name: name} = Trento.Repo.get!(ClusterReadModel, cluster_id)

    EmailAlert.alert("Cluster", "name", name, "health is now in critical state")
    |> deliver_notification()
  end

  @spec notify_critical_database_health(String.t()) :: :ok
  def notify_critical_database_health(id) do
    %DatabaseReadModel{sid: sid} = Trento.Repo.get!(DatabaseReadModel, id)

    EmailAlert.alert("Database", "SID", sid, "health is now in critical state")
    |> deliver_notification()
  end

  @spec notify_critical_sap_system_health(String.t()) :: :ok
  def notify_critical_sap_system_health(id) do
    %SapSystemReadModel{sid: sid} = Trento.Repo.get!(SapSystemReadModel, id)

    EmailAlert.alert("Sap System", "SID", sid, "health is now in critical state")
    |> deliver_notification()
  end

  @spec deliver_notification(Swoosh.Email.t()) :: :ok
  defp deliver_notification(%Swoosh.Email{} = notification) do
    maybe_deliver_notification(Application.fetch_env!(:trento, :alerting)[:enabled], notification)
  end

  @spec maybe_deliver_notification(false, Swoosh.Email.t()) :: :ok
  defp maybe_deliver_notification(false, _), do: :ok

  @spec maybe_deliver_notification(true, Swoosh.Email.t()) :: :ok
  defp maybe_deliver_notification(true, %Swoosh.Email{subject: subject} = notification) do
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
