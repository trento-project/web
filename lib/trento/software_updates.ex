defmodule Trento.SoftwareUpdates do
  @moduledoc """
  Entry point for the software updates feature.
  """
  require Logger

  alias Ecto.Changeset

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
          {:ok, software_update_settings} | {:error, any()}
  def save_settings(settings_submission, date_service \\ DateService) do
    changeset =
      Settings
      |> Repo.one!()
      |> Settings.changeset(settings_submission)
      |> Changeset.validate_required([:url, :username, :password])
      |> Changeset.validate_change(:url, &validate_url/2)
      |> Changeset.prepare_changes(maybe_add_cert_upload_date(date_service))

    case Repo.update(changeset) do
      {:ok, saved_settings} ->
        {:ok, map_to_settings_result(saved_settings)}

      {:error, reason} = error ->
        Logger.error("Error while saving software updates settings: #{inspect(reason)}")

        error
    end
  end

  defp has_valid_settings?(%Settings{url: url, username: username, password: password}),
    do: url != nil and username != nil and password != nil

  defp map_to_settings_result(%Settings{} = settings),
    do: Map.take(settings, [:url, :username, :password, :ca_cert, :ca_uploaded_at])

  defp validate_url(_url_atom, url) do
    %URI{scheme: scheme} = URI.parse(url)

    case scheme do
      "https" ->
        []

      _ ->
        [url: {"can only be an https url", validation: :https_url_only}]
    end
  end

  defp maybe_add_cert_upload_date(date_service) do
    fn changeset ->
      if Changeset.get_change(changeset, :ca_cert) do
        Changeset.put_change(changeset, :ca_uploaded_at, date_service.utc_now())
      else
        changeset
      end
    end
  end
end
