defmodule Trento.ActivityLog do
  @moduledoc """
  Activity Log module provides functionality to manage activity log settings and track activity.
  """

  import Ecto.Query

  require Logger

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

  defp log_error({:error, _} = error, message) do
    Logger.error("#{message}: #{inspect(error)}")
    error
  end

  defp log_error(result, _), do: result
end
