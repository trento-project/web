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
             | :error_getting_affected_packages
             | :max_login_retries_reached}
  def get_packages_patches(host_id) do
    with {:ok, _} <- Settings.get_suse_manager_settings(),
         {:ok, relevant_patches, upgradable_packages} <- Discovery.get_discovery_result(host_id),
         {:ok, affected_packages_for_patches} <-
           get_affected_packages_for_patches(relevant_patches) do
      result = group_patches(upgradable_packages, affected_packages_for_patches)

      {:ok, result}
    end
  end

  defp get_affected_packages_for_patches(relevant_patches) do
    affected_packages_for_patches =
      relevant_patches
      |> ParallelStream.map(fn %{advisory_name: advisory_name} = advisory ->
        {advisory, Discovery.get_affected_packages(advisory_name)}
      end)
      |> Enum.map(fn
        {_, {:error, _} = error} -> error
        {advisory, {:ok, packages}} -> Map.put(advisory, :packages, packages)
      end)

    if Enum.any?(affected_packages_for_patches, &match?({:error, _}, &1)) do
      {:error, :error_getting_affected_packages}
    else
      {:ok, affected_packages_for_patches}
    end
  end

  defp group_patches(upgradable_packages, affected_packages_for_patches),
    do:
      Enum.map(upgradable_packages, fn %{to_package_id: to_package_id, name: package_name} ->
        patches = filter_affected_packages(affected_packages_for_patches, package_name)

        %{package_id: to_package_id, patches: patches}
      end)

  defp filter_affected_packages(affected_packages_for_patches, package_name),
    do:
      Enum.filter(affected_packages_for_patches, fn %{packages: packages} ->
        Enum.find(packages, fn %{name: name} -> name === package_name end)
      end)
end
