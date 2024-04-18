defmodule Trento.SoftwareUpdates.Discovery do
  @moduledoc """
  Software updates integration service
  """

  alias Trento.Hosts

  alias Trento.Hosts.Commands.{
    ClearSoftwareUpdatesDiscovery,
    CompleteSoftwareUpdatesDiscovery
  }

  alias Trento.Hosts.Projections.HostReadModel

  require Trento.SoftwareUpdates.Enums.SoftwareUpdatesHealth, as: SoftwareUpdatesHealth
  require Trento.SoftwareUpdates.Enums.AdvisoryType, as: AdvisoryType

  require Logger

  @behaviour Trento.SoftwareUpdates.Discovery.Gen

  @impl true
  def setup, do: adapter().setup()

  @impl true
  def get_system_id(fully_qualified_domain_name),
    do: adapter().get_system_id(fully_qualified_domain_name)

  @impl true
  def get_relevant_patches(system_id),
    do: adapter().get_relevant_patches(system_id)

  @impl true
  def clear, do: adapter().clear()

  @impl true
  def get_upgradable_packages(system_id),
    do: adapter().get_upgradable_packages(system_id)

  @spec discover_software_updates :: {:ok, {list(), list()}}
  def discover_software_updates do
    {:ok,
     Hosts.get_all_hosts()
     |> ParallelStream.map(fn
       %HostReadModel{id: host_id, fully_qualified_domain_name: fully_qualified_domain_name} ->
         case discover_host_software_updates(host_id, fully_qualified_domain_name) do
           {:error, error} ->
             {:error, host_id, error}

           {:ok, _, _, _} = success ->
             success
         end
     end)
     |> Enum.split_with(fn
       {:ok, _, _, _} -> true
       _ -> false
     end)}
  end

  @spec clear_software_updates_discoveries :: :ok | {:error, any()}
  def clear_software_updates_discoveries do
    Hosts.get_all_hosts()
    |> Enum.map(fn %HostReadModel{id: host_id} -> %{host_id: host_id} end)
    |> Enum.each(fn command_payload ->
      command_payload
      |> ClearSoftwareUpdatesDiscovery.new!()
      |> commanded().dispatch()
    end)

    clear()

    :ok
  end

  @spec discover_host_software_updates(String.t(), String.t()) ::
          {:ok, String.t(), String.t(), any()} | {:error, any()}
  def discover_host_software_updates(host_id, nil) do
    Logger.info("Host #{host_id} does not have an fqdn. Skipping software updates discovery")
    {:error, :host_without_fqdn}
  end

  def discover_host_software_updates(host_id, fully_qualified_domain_name) do
    with {:ok, system_id} <- get_system_id(fully_qualified_domain_name),
         {:ok, relevant_patches} <- get_relevant_patches(system_id),
         :ok <-
           host_id
           |> build_discovery_completion_command(relevant_patches)
           |> commanded().dispatch() do
      {:ok, host_id, system_id, relevant_patches}
    else
      {:error, discovery_error} = error ->
        Logger.error(
          "An error occurred during software updates discovery for host #{host_id}:  #{inspect(error)}"
        )

        commanded().dispatch(
          CompleteSoftwareUpdatesDiscovery.new!(%{
            host_id: host_id,
            health: SoftwareUpdatesHealth.unknown()
          })
        )

        {:error, discovery_error}
    end
  end

  defp build_discovery_completion_command(host_id, relevant_patches),
    do:
      CompleteSoftwareUpdatesDiscovery.new!(%{
        host_id: host_id,
        health:
          relevant_patches
          |> track_relevant_patches
          |> compute_software_updates_discovery_health
      })

  defp track_relevant_patches(relevant_patches),
    do:
      Enum.reduce(
        relevant_patches,
        %{
          security_advisories: 0,
          bug_fixes: 0,
          software_enhancements: 0
        },
        &track_relevant_patch/2
      )

  defp track_relevant_patch(
         %{advisory_type: AdvisoryType.security_advisory()},
         %{
           security_advisories: security_advisories
         } = patches
       ),
       do: %{patches | security_advisories: security_advisories + 1}

  defp track_relevant_patch(
         %{advisory_type: AdvisoryType.bugfix()},
         %{
           bug_fixes: bug_fixes
         } = patches
       ),
       do: %{patches | bug_fixes: bug_fixes + 1}

  defp track_relevant_patch(
         %{advisory_type: AdvisoryType.enhancement()},
         %{
           software_enhancements: software_enhancements
         } = patches
       ),
       do: %{patches | software_enhancements: software_enhancements + 1}

  defp compute_software_updates_discovery_health(%{
         security_advisories: 0,
         bug_fixes: 0,
         software_enhancements: 0
       }),
       do: SoftwareUpdatesHealth.passing()

  defp compute_software_updates_discovery_health(%{
         security_advisories: security_advisories
       })
       when security_advisories > 0,
       do: SoftwareUpdatesHealth.critical()

  defp compute_software_updates_discovery_health(_), do: SoftwareUpdatesHealth.warning()

  defp adapter, do: Application.fetch_env!(:trento, __MODULE__)[:adapter]

  defp commanded, do: Application.fetch_env!(:trento, Trento.Commanded)[:adapter]
end
