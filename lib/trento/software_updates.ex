defmodule Trento.SoftwareUpdates do
  @moduledoc """
  Entry point for the software updates feature.
  """
  require Logger

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
    settings = Repo.one(Settings.base_query())

    if settings do
      {:ok, settings}
    else
      {:error, :settings_not_configured}
    end
  end

  @spec save_settings(software_update_settings_save_submission, module()) ::
          {:ok, Settings.t()}
          | {:error, :settings_already_configured}
          | {:error, any()}
  def save_settings(settings_submission, date_service \\ DateService) do
    with {:ok, :settings_not_configured, settings} <- ensure_no_settings_configured() do
      settings
      |> save_or_update_settings(settings_submission, date_service)
      |> log_error("Error while saving software updates settings")
    end
  end

  @spec change_settings(software_update_settings_change_submission, module()) ::
          {:ok, Settings.t()}
          | {:error, :settings_not_configured}
          | {:error, any()}
  def change_settings(settings_submission, date_service \\ DateService) do
    with {:ok, settings} <- get_settings() do
      settings
      |> save_or_update_settings(settings_submission, date_service)
      |> log_error("Error while updating software updates settings")
    end
  end

  @spec clear_settings :: :ok
  def clear_settings do
    Repo.delete_all(Settings.base_query())

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
          | {:error,
             :settings_not_configured
             | :not_found
             | :system_id_not_found
             | :error_getting_patches
             | :error_getting_packages
             | :max_login_retries_reached}
  def get_software_updates(host_id) do
    with {:ok, _} <- get_settings(),
         {:ok, relevant_patches, upgradable_packages} <- Discovery.get_discovery_result(host_id) do
      {:ok, %{relevant_patches: relevant_patches, upgradable_packages: upgradable_packages}}
    end
  end

  @spec get_packages_patches([String.t()]) ::
          {:ok, [map()]}
          | {:error,
             :settings_not_configured
             | :error_getting_patches
             | :max_login_retries_reached}
  def get_packages_patches(package_ids) do
    with {:ok, _} <- get_settings() do
      result =
        package_ids
        |> ParallelStream.map(fn package_id ->
          {package_id, Discovery.get_patches_for_package(package_id)}
        end)
        |> Enum.map(fn
          {package_id, {:ok, patches}} -> %{package_id: package_id, patches: patches}
          {package_id, _} -> %{package_id: package_id, patches: []}
        end)

      {:ok, result}
    end
  end

  defp ensure_no_settings_configured do
    case Repo.one(Settings.base_query()) do
      nil ->
        {:ok, :settings_not_configured, nil}

      %Settings{} ->
        Logger.error("Error: software updates settings already configured")
        {:error, :settings_already_configured}
    end
  end

  defp save_or_update_settings(settings, settings_submission, date_service) do
    result =
      case settings do
        nil ->
          %Settings{}
          |> Settings.changeset(settings_submission, date_service)
          |> Repo.insert()

        %Settings{} ->
          settings
          |> Settings.changeset(settings_submission, date_service)
          |> Repo.update()
      end

    case result do
      {:ok, _} = success ->
        Discovery.clear()

        Task.Supervisor.start_child(Trento.TasksSupervisor, fn ->
          Discovery.discover_software_updates()
        end)

        success

      {:error, _} = error ->
        error
    end
  end

  defp log_error({:error, _} = error, message) do
    Logger.error("#{message}: #{inspect(error)}")
    error
  end

  defp log_error(result, _), do: result
end
