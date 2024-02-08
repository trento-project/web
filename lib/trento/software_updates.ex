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
    with {:error, :settings_not_configured} <- get_settings(),
         {:ok, saved_settings} <-
           %Settings{}
           |> Settings.changeset(settings_submission, date_service)
           |> Repo.insert() do
      {:ok, saved_settings}
    else
      {:ok, %Settings{} = _} ->
        {:error, :settings_already_configured}

      _ = error ->
        Logger.error("Error while saving software updates settings: #{inspect(error)}")

        error
    end
  end

  @spec change_settings(software_update_settings_change_submission, module()) ::
          {:ok, Settings.t()}
          | {:error, :settings_not_configured}
          | {:error, any()}
  def change_settings(settings_submission, date_service \\ DateService) do
    with {:ok, settings} <- get_settings(),
         {:ok, updated_settings} <-
           settings
           |> Settings.changeset(settings_submission, date_service)
           |> Repo.update() do
      {:ok, updated_settings}
    else
      _ = error ->
        Logger.error("Error while updating software updates settings: #{inspect(error)}")

        error
    end
  end

  @spec clear_settings :: :ok
  def clear_settings do
    Repo.delete_all(Settings)

    :ok
  end
end
