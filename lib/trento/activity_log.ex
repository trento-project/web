defmodule Trento.ActivityLog do
  @moduledoc """
  Activity Log module provides functionality to manage activity log settings and track activity.
  """

  import Ecto.Query

  require Logger

  alias Trento.ActivityLog.RetentionTime
  require Trento.ActivityLog.RetentionPeriodUnit, as: RetentionPeriodUnit
  alias Trento.ActivityLog.ActivityLog
  alias Trento.ActivityLog.Settings
  alias Trento.Repo

  @spec get_settings() ::
          {:ok, Settings.t()} | {:error, :not_found}
  def get_settings do
    case Repo.one(Settings.base_query()) do
      %Settings{} = settings -> {:ok, settings}
      nil -> {:error, :not_found}
    end
  end

  @spec change_retention_period(integer(), RetentionPeriodUnit.t()) ::
          {:ok, Settings.t()}
          | {:error, :activity_log_settings_not_configured}
  def change_retention_period(value, unit) do
    case get_settings() do
      {:ok, settings} ->
        settings
        |> Settings.changeset(%{
          retention_time: %{
            value: value,
            unit: unit
          }
        })
        |> Repo.update()
        |> log_error("Error while updating activity log retention period")

      {:error, :not_found} ->
        {:error, :activity_log_settings_not_configured}
    end
  end

  @spec list_activity_log() :: list(ActivityLog.t())
  def list_activity_log do
    # This will be made filterable/paginatable in a later PR
    query =
      from activity in ActivityLog,
        order_by: [desc: activity.inserted_at]

    Repo.all(query)
  end

  @spec clear_expired_logs() :: :ok | {:error, any()}
  def clear_expired_logs do
    with {:ok, retention_time} <- get_retention_time(),
         expiration_date <- calculate_expiration_date(retention_time) do
      delete_logs_before(expiration_date)
      :ok
    end
  end

  defp log_error({:error, _} = error, message) do
    Logger.error("#{message}: #{inspect(error)}")
    error
  end

  defp log_error(result, _), do: result

  defp get_retention_time do
    case Trento.ActivityLog.get_settings() do
      {:ok, settings} -> {:ok, settings.retention_time}
      {:error, _} = error -> error
    end
  end

  defp calculate_expiration_date(%RetentionTime{value: value, unit: :day}),
    do: DateTime.add(DateTime.utc_now(), -value, :day)

  defp calculate_expiration_date(%RetentionTime{value: value, unit: :week}),
    do: DateTime.add(DateTime.utc_now(), -value * 7, :day)

  defp calculate_expiration_date(%RetentionTime{value: value, unit: :month}),
    do: DateTime.add(DateTime.utc_now(), -value * 30, :day)

  defp calculate_expiration_date(%RetentionTime{value: value, unit: :year}),
    do: DateTime.add(DateTime.utc_now(), -value * 365, :day)

  defp delete_logs_before(%DateTime{} = expiration_date) do
    Repo.delete_all(from l in ActivityLog, where: l.inserted_at < ^expiration_date)
  end
end
