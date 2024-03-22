defmodule Trento.SoftwareUpdates do
  @moduledoc """
  Entry point for the software updates feature.
  """
  require Logger

  alias Trento.Hosts
  alias Trento.Hosts.Projections.HostReadModel

  alias Trento.Support.DateService

  alias Trento.Repo
  alias Trento.SoftwareUpdates.Discovery
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
    case has_settings?(settings = Repo.one!(Settings)) do
      true ->
        {:ok, settings}

      false ->
        {:error, :settings_not_configured}
    end
  end

  @spec save_settings(software_update_settings_save_submission, module()) ::
          {:ok, Settings.t()}
          | {:error, :settings_already_configured}
          | {:error, any()}
  def save_settings(settings_submission, date_service \\ DateService) do
    with {:ok, :settings_not_configured, settings} <- ensure_no_settings_configured() do
      save_new_settings(settings, settings_submission, date_service)
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
    {1, _} =
      Repo.update_all(Settings,
        set: [
          url: nil,
          username: nil,
          password: nil,
          ca_cert: nil,
          ca_uploaded_at: nil,
          updated_at: DateTime.utc_now()
        ]
      )

    Discovery.clear_software_updates_discoveries()

    :ok
  end

  @spec test_connection_settings :: :ok | {:error, :connection_test_failed}
  def test_connection_settings do
    case Discovery.setup() do
      :ok ->
        :ok

      error ->
        Logger.error(
          "Error while testing connection with software updates provider: #{inspect(error)}"
        )

        {:error, :connection_test_failed}
    end
  end

  @spec run_discovery :: :ok | {:error, :settings_not_configured}
  def run_discovery do
    case get_settings() do
      {:ok, _} ->
        Discovery.discover_software_updates()
        :ok

      error ->
        Logger.error("Software updates settings not configured. Skipping discovery.")

        error
    end
  end

  @spec get_software_updates(Ecto.UUID.t()) ::
          {:ok, map()}
          | {:error, :settings_not_configured,
             :system_id_not_found
             | :not_found
             | :fqdn_not_found
             | :error_getting_patches
             | :error_getting_packages}
  def get_software_updates(host_id) do
    with {:ok, _} <- get_settings(),
         {:ok, fqdn} <- get_host_fqdn(host_id),
         {:ok, system_id} <- Discovery.get_system_id(fqdn),
         {:ok, relevant_patches} <- Discovery.get_relevant_patches(system_id),
         {:ok, upgradable_packages} <-
           Discovery.get_upgradable_packages(system_id) do
      {:ok, %{relevant_patches: relevant_patches, upgradable_packages: upgradable_packages}}
    end
  end

  defp get_host_fqdn(host_id) do
    case Hosts.get_host_by_id(host_id) do
      nil -> {:error, :not_found}
      %HostReadModel{fully_qualified_domain_name: nil} -> {:error, :fqdn_not_found}
      %HostReadModel{fully_qualified_domain_name: fqdn} -> {:ok, fqdn}
    end
  end

  defp has_settings?(%Settings{url: url, username: username, password: password}),
    do: url != nil and username != nil and password != nil

  defp ensure_no_settings_configured do
    case has_settings?(settings = Repo.one!(Settings)) do
      false ->
        {:ok, :settings_not_configured, settings}

      true ->
        Logger.error("Error: software updates settings already configured")
        {:error, :settings_already_configured}
    end
  end

  defp save_new_settings(%Settings{} = settings, settings_submission, date_service) do
    saving_result =
      settings
      |> Settings.changeset(settings_submission, date_service)
      |> Repo.update()

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
