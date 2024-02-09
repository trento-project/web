defmodule Trento.SoftwareUpdates do
  @moduledoc """
  Entry point for the software updates feature.
  """
  require Logger

  alias Trento.Support.DateService

  alias Trento.Repo
  alias Trento.SoftwareUpdates.Settings

  @type software_update_settings_save_submission :: %{
          url: String.t(),
          username: String.t(),
          password: String.t(),
          ca_cert: String.t() | nil
        }

  @type software_update_settings_change_submission :: %{
          url: String.t() | nil,
          username: String.t() | nil,
          password: String.t() | nil,
          ca_cert: String.t() | nil
        }

  @spec get_settings :: {:ok, Settings.t()} | {:error, :settings_not_configured}
  def get_settings do
    case Repo.one(Settings) do
      nil ->
        {:error, :settings_not_configured}

      settings ->
        {:ok, settings}
    end
  end

  @spec save_settings(software_update_settings_save_submission, module()) ::
          {:ok, Settings.t()}
          | {:error, :settings_already_configured}
          | {:error, any()}
  def save_settings(settings_submission, date_service \\ DateService) do
    with :ok <- ensure_no_settings_configured() do
      save_new_settings(settings_submission, date_service)
    end
  end

  @spec change_settings(software_update_settings_change_submission, module()) ::
          {:ok, Settings.t()}
          | {:error, :settings_not_configured}
          | {:error, any()}
  def change_settings(settings_submission, date_service \\ DateService) do
    with {:ok, settings} <- get_settings() do
      update_settings(settings, settings_submission, date_service)
    end
  end

  @spec clear_settings :: :ok
  def clear_settings do
    Repo.delete_all(Settings)

    :ok
  end

  defp ensure_no_settings_configured do
    case get_settings() do
      {:error, :settings_not_configured} ->
        :ok

      {:ok, %Settings{} = _} ->
        Logger.error("Error: software updates settings already configured")

        {:error, :settings_already_configured}
    end
  end

  defp save_new_settings(settings_submission, date_service) do
    saving_result =
      %Settings{}
      |> Settings.changeset(settings_submission, date_service)
      |> Repo.insert()

    case saving_result do
      {:ok, _} = success ->
        success

      {:error, _} = error ->
        Logger.error("Error while saving software updates settings: #{inspect(error)}")

        error
    end
  end

  defp update_settings(%Settings{} = settings, settings_submission, date_service) do
    update_result =
      settings
      |> Settings.changeset(settings_submission, date_service)
      |> Repo.update()

    case update_result do
      {:ok, _} = success ->
        success

      {:error, _} = error ->
        Logger.error("Error while updating software updates settings: #{inspect(error)}")

        error
    end
  end
end
