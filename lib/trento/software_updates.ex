defmodule Trento.SoftwareUpdates do
  @moduledoc """
  Entry point for the software updates feature.
  """
  require Logger

  alias Trento.Settings
  alias Trento.SoftwareUpdates.Discovery

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
    case Settings.get_suse_manager_settings() do
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
    with {:ok, _} <- Settings.get_suse_manager_settings(),
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
    with {:ok, _} <- Settings.get_suse_manager_settings() do
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
end
