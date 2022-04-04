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

  @spec notify_host_heartbeating_failure(binary()) :: :ok | {:error, any}
  def notify_host_heartbeating_failure(host_id) do
    %HostReadModel{hostname: hostname} = Trento.Repo.get!(HostReadModel, host_id)

    EmailAlert.alert("Host", "hostname", hostname, "heartbeat failed")
    |> deliver_notification()
  end

  @spec notify_critical_cluster_health(binary()) :: :ok | {:error, any}
  def notify_critical_cluster_health(cluster_id) do
    %ClusterReadModel{name: name} = Trento.Repo.get!(ClusterReadModel, cluster_id)

    EmailAlert.alert("Cluster", "name", name, "health is now in critical state")
    |> deliver_notification()
  end

  @spec notify_critical_database_health(binary()) :: :ok | {:error, any}
  def notify_critical_database_health(id) do
    %DatabaseReadModel{sid: sid} = Trento.Repo.get!(DatabaseReadModel, id)

    EmailAlert.alert("Database", "SID", sid, "health is now in critical state")
    |> deliver_notification()
  end

  @spec notify_critical_sap_system_health(binary()) :: :ok | {:error, any}
  def notify_critical_sap_system_health(id) do
    %SapSystemReadModel{sid: sid} = Trento.Repo.get!(SapSystemReadModel, id)

    EmailAlert.alert("Sap System", "SID", sid, "health is now in critical state")
    |> deliver_notification()
  end

  defp deliver_notification(%Swoosh.Email{subject: subject} = notification) do
    notification
    |> Mailer.deliver()
    |> case do
      {:ok, _} ->
        :ok

      {:error, reason} = error ->
        Logger.error("Failed to send alert notification with subject \"#{subject}\": #{reason}",
          error: reason
        )

        error
    end
  end
end
