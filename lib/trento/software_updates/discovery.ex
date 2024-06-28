defmodule Trento.SoftwareUpdates.Discovery do
  @moduledoc """
  Software updates integration service
  """

  import Ecto.Query

  alias Trento.Repo

  alias Ecto.Multi

  alias Trento.Hosts

  alias Trento.Hosts.Commands.{
    ClearSoftwareUpdatesDiscovery,
    CompleteSoftwareUpdatesDiscovery
  }

  alias Trento.Hosts.Projections.HostReadModel
  alias Trento.SoftwareUpdates.Discovery.DiscoveryResult

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

  @impl true
  def get_patches_for_package(package_id),
    do: adapter().get_patches_for_package(package_id)

  @impl true
  def get_errata_details(advisory_name),
    do: adapter().get_errata_details(advisory_name)

  @impl true
  def get_cves(advisory_name),
    do: adapter().get_cves(advisory_name)

  @impl true
  def get_affected_systems(advisory_name),
    do: adapter().get_affected_systems(advisory_name)

  @impl true
  def get_affected_packages(advisory_name), do: adapter().get_affected_packages(advisory_name)

  @impl true
  def get_bugzilla_fixes(advisory_name), do: adapter().get_bugzilla_fixes(advisory_name)

  @spec discover_software_updates :: {:ok, {list(), list()}}
  def discover_software_updates do
    authentication = setup()

    {:ok,
     Hosts.get_all_hosts()
     |> ParallelStream.map(fn
       %HostReadModel{id: host_id, fully_qualified_domain_name: fully_qualified_domain_name} ->
         case discover_host_software_updates(host_id, fully_qualified_domain_name, authentication) do
           {:error, error} ->
             {:error, host_id, error}

           {:ok, _, _, _, _} = success ->
             success
         end
     end)
     |> Enum.split_with(fn
       {:ok, _, _, _, _} -> true
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

  @spec get_discovery_result(String.t()) :: {:ok, list(), list()} | {:error, any()}
  def get_discovery_result(host_id) do
    DiscoveryResult
    |> Repo.get(host_id)
    |> handle_discovery_result()
  end

  @spec clear_tracked_discovery_result(String.t()) :: :ok
  def clear_tracked_discovery_result(host_id) do
    Repo.delete_all(from d in DiscoveryResult, where: d.host_id == ^host_id)
    :ok
  end

  @spec discover_host_software_updates(String.t(), String.t()) ::
          {:ok, String.t(), String.t(), any(), any()} | {:error, any()}
  def discover_host_software_updates(host_id, nil) do
    Logger.info("Host #{host_id} does not have an fqdn. Skipping software updates discovery")
    {:error, :host_without_fqdn}
  end

  def discover_host_software_updates(host_id, fully_qualified_domain_name) do
    with {:ok, system_id} <- get_system_id(fully_qualified_domain_name),
         {:ok, relevant_patches} <- get_relevant_patches(system_id),
         {:ok, upgradable_packages} <- get_upgradable_packages(system_id),
         {:ok, _} <-
           finalize_successful_discovery(
             host_id,
             system_id,
             relevant_patches,
             upgradable_packages
           ) do
      {:ok, host_id, system_id, relevant_patches, upgradable_packages}
    else
      {:error, :settings_not_configured} ->
        {:error, :settings_not_configured}

      {:error, _} = error ->
        Logger.error(
          "An error occurred during software updates discovery for host #{host_id}:  #{inspect(error)}"
        )

        finalize_failed_discovery(host_id, error)

        error
    end
  end

  defp discover_host_software_updates(_, _, {:error, :settings_not_configured} = error),
    do: error

  defp discover_host_software_updates(host_id, _, {:error, _} = error) do
    finalize_failed_discovery(host_id, error)
    error
  end

  defp discover_host_software_updates(host_id, fully_qualified_domain_name, _),
    do: discover_host_software_updates(host_id, fully_qualified_domain_name)

  defp finalize_failed_discovery(host_id, {:error, reason}) do
    %DiscoveryResult{}
    |> DiscoveryResult.changeset(%{
      host_id: host_id,
      system_id: nil,
      relevant_patches: nil,
      upgradable_packages: nil,
      failure_reason: Atom.to_string(reason)
    })
    |> finalize_discovery(host_id, SoftwareUpdatesHealth.unknown())
  end

  defp finalize_successful_discovery(host_id, system_id, relevant_patches, upgradable_packages) do
    %DiscoveryResult{}
    |> DiscoveryResult.changeset(%{
      host_id: host_id,
      system_id: "#{system_id}",
      relevant_patches: relevant_patches,
      upgradable_packages: upgradable_packages
    })
    |> finalize_discovery(
      host_id,
      relevant_patches
      |> track_relevant_patches
      |> compute_software_updates_discovery_health
    )
  end

  defp finalize_discovery(discovery_result, host_id, discovered_health) do
    transaction_result =
      Multi.new()
      |> Multi.insert(:insert, discovery_result,
        conflict_target: :host_id,
        on_conflict: :replace_all
      )
      |> Multi.run(:command_dispatching, fn _, _ ->
        dispatch_completion_command(host_id, discovered_health)
      end)
      |> Repo.transaction()

    case transaction_result do
      {:ok, _} = success ->
        success

      {:error, :command_dispatching, dispatching_error, _} ->
        {:error, dispatching_error}

      {:error, _} = error ->
        Logger.error(
          "Error while finalizing software updates discovery for host #{host_id}, error: #{inspect(error)}"
        )

        error
    end
  end

  defp dispatch_completion_command(host_id, discovered_health) do
    case %{
           host_id: host_id,
           health: discovered_health
         }
         |> CompleteSoftwareUpdatesDiscovery.new!()
         |> commanded().dispatch() do
      :ok ->
        {:ok, :dispatched}

      {:error, _} = error ->
        error
    end
  end

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

  defp handle_discovery_result(nil), do: {:error, :not_found}

  defp handle_discovery_result(%DiscoveryResult{failure_reason: failure_reason})
       when not is_nil(failure_reason),
       do: {:error, failure_reason_to_atom(failure_reason)}

  defp handle_discovery_result(%DiscoveryResult{
         relevant_patches: relevant_patches,
         upgradable_packages: upgradable_packages
       }) do
    {
      :ok,
      keys_to_atoms(relevant_patches),
      keys_to_atoms(upgradable_packages)
    }
  end

  defp failure_reason_to_atom("system_id_not_found"), do: :system_id_not_found
  defp failure_reason_to_atom("error_getting_patches"), do: :error_getting_patches
  defp failure_reason_to_atom("error_getting_packages"), do: :error_getting_packages
  defp failure_reason_to_atom("max_login_retries_reached"), do: :max_login_retries_reached
  defp failure_reason_to_atom(_), do: :unknown_discovery_error

  defp keys_to_atoms(discovered_result_list),
    do:
      discovered_result_list
      |> Jason.encode!()
      |> Jason.decode!(keys: :atoms)

  defp adapter, do: Application.fetch_env!(:trento, __MODULE__)[:adapter]

  defp commanded, do: Application.fetch_env!(:trento, Trento.Commanded)[:adapter]
end
