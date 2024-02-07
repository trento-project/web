defmodule Trento.SoftwareUpdates do
  @moduledoc """
  Entry point for the software updates feature.
  """
  require Logger

  alias Trento.Support.DateService

  alias Trento.Repo
  alias Trento.SoftwareUpdates.Settings

  @type software_update_settings :: %{
          url: String.t(),
          username: String.t(),
          password: String.t(),
          ca_cert: String.t() | nil,
          ca_uploaded_at: DateTime.t() | nil
        }

  @type software_update_settings_submission :: %{
          url: String.t(),
          username: String.t(),
          password: String.t(),
          ca_cert: String.t() | nil
        }

  @spec get_settings :: {:ok, software_update_settings} | {:error, :settings_not_configured}
  def get_settings do
    settings = Repo.one!(Settings)

    if has_valid_settings?(settings) do
      {:ok, map_to_settings_result(settings)}
    else
      {:error, :settings_not_configured}
    end
  end

  @spec save_settings(software_update_settings_submission, module()) ::
          {:ok, software_update_settings}
          | {:error, :settings_already_configured}
          | {:error, any()}
  def save_settings(settings_submission, date_service \\ DateService) do
    with settings <- Repo.one!(Settings),
         false <- has_valid_settings?(settings),
         {:ok, saved_settings} <-
           settings
           |> Settings.apply_saving_changeset(settings_submission, date_service)
           |> Repo.update() do
      {:ok, map_to_settings_result(saved_settings)}
    else
      true ->
        {:error, :settings_already_configured}

      {:error, reason} = error ->
        Logger.error("Error while saving software updates settings: #{inspect(reason)}")

        error
    end
  end

  defp has_valid_settings?(%Settings{url: url, username: username, password: password}),
    do: url != nil and username != nil and password != nil

  defp map_to_settings_result(%Settings{} = settings),
    do: Map.take(settings, [:url, :username, :password, :ca_cert, :ca_uploaded_at])
end
