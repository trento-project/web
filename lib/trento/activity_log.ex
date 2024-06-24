defmodule Trento.ActivityLog do
  @moduledoc """
  Activity Log module provides functionality to manage activity log settings and track activity.
  """

  require Logger

  require Trento.ActivityLog.RetentionPeriodUnit, as: RetentionPeriodUnit

  alias Trento.ActivityLog.Settings

  alias Trento.Repo

  @spec get_settings() ::
          {:ok, Settings.t()} | {:error, :activity_log_settings_not_configured}
  def get_settings do
    case Repo.one(Settings.base_query()) do
      %Settings{} = settings -> {:ok, settings}
      nil -> {:error, :activity_log_settings_not_configured}
    end
  end

  @spec change_retention_period(integer(), RetentionPeriodUnit.t()) ::
          {:ok, Settings.t()}
          | {:error, :activity_log_settings_not_configured}
          | {:error, any()}
  def change_retention_period(value, unit) do
    with {:ok, settings} <- get_settings() do
      settings
      |> Settings.changeset(%{
        retention_time: %{
          value: value,
          unit: unit
        }
      })
      |> Repo.update()
      |> log_error("Error while updating activity log retention period")
    end
  end

  defp log_error({:error, _} = error, message) do
    Logger.error("#{message}: #{inspect(error)}")
    error
  end

  defp log_error(result, _), do: result
end
