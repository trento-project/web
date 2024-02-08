defmodule Trento.SoftwareUpdates do
  @moduledoc """
  Entry point for the software updates feature.
  """
  require Logger

  alias Trento.Support.DateService

  alias Trento.Repo
  alias Trento.SoftwareUpdates.Settings

  @type software_update_settings_submission :: %{
          url: String.t(),
          username: String.t(),
          password: String.t(),
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

  @spec save_settings(software_update_settings_submission, module()) ::
          {:ok, Settings.t()}
          | {:error, :settings_already_configured}
          | {:error, any()}
  def save_settings(settings_submission, date_service \\ DateService) do
    if Repo.one(Settings) do
      {:error, :settings_already_configured}
    else
      result =
        %Settings{} |> Settings.changeset(settings_submission, date_service) |> Repo.insert()

      case result do
        {:ok, saved_settings} ->
          {:ok, saved_settings}

        {:error, reason} = error ->
          Logger.error("Error while saving software updates settings: #{inspect(reason)}")

          error
      end
    end
  end

  @spec clear_settings :: :ok
  def clear_settings do
    Repo.delete_all(Settings)

    :ok
  end
end
