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

  require Trento.SoftwareUpdates.Enums.AdvisoryType, as: AdvisoryType

  require Logger

  @behaviour Trento.SoftwareUpdates.Discovery.Gen

  @impl true
  def get_system_id(fully_qualified_domain_name),
    do: adapter().get_system_id(fully_qualified_domain_name)

  @impl true
  def get_relevant_patches(system_id),
    do: adapter().get_relevant_patches(system_id)

  @impl true
  def clear, do: adapter().clear()

  @spec discover_software_updates :: {:ok, {list(), list()}}
  def discover_software_updates,
    do:
      {:ok,
       Hosts.get_all_hosts()
       |> Enum.map(&discover_host_software_updates/1)
       |> Enum.split_with(fn
         {:ok, _, _, _} -> true
         _ -> false
       end)}

  @spec clear_software_updates_discoveries :: :ok | {:error, any()}
  def clear_software_updates_discoveries do
    hosts = Hosts.get_all_hosts()

    if !Enum.empty?(hosts) do
      Enum.each(hosts, fn %HostReadModel{id: host_id} ->
        %{host_id: host_id}
        |> ClearSoftwareUpdatesDiscovery.new!()
        |> commanded().dispatch()
      end)

      clear()
    end

    :ok
  end

  defp discover_host_software_updates(%HostReadModel{
         id: host_id,
         fully_qualified_domain_name: nil
       }) do
    Logger.info("Host #{host_id} does not have an fqdn. Skipping software updates discovery")
    {:error, host_id, :host_without_fqdn}
  end

  defp discover_host_software_updates(%HostReadModel{
         id: host_id,
         fully_qualified_domain_name: fully_qualified_domain_name
       }) do
    with {:ok, system_id} <- get_system_id(fully_qualified_domain_name),
         {:ok, relevant_patches} <- get_relevant_patches(system_id),
         :ok <-
           host_id
           |> build_discovery_completion_command(relevant_patches)
           |> commanded().dispatch() do
      {:ok, host_id, system_id, relevant_patches}
    else
      error ->
        Logger.error(
          "An error occurred during software updates discovery for host #{host_id}:  #{inspect(error)}"
        )

        {:error, host_id, error}
    end
  end

  defp build_discovery_completion_command(host_id, relevant_patches),
    do:
      CompleteSoftwareUpdatesDiscovery.new!(%{
        host_id: host_id,
        relevant_patches:
          Enum.reduce(
            relevant_patches,
            %{
              security_advisories: 0,
              bug_fixes: 0,
              software_enhancements: 0
            },
            &track_relevant_patches/2
          )
      })

  defp track_relevant_patches(
         %{advisory_type: AdvisoryType.security_advisory()},
         %{
           security_advisories: security_advisories
         } = patches
       ),
       do: %{patches | security_advisories: security_advisories + 1}

  defp track_relevant_patches(
         %{advisory_type: AdvisoryType.bugfix()},
         %{
           bug_fixes: bug_fixes
         } = patches
       ),
       do: %{patches | bug_fixes: bug_fixes + 1}

  defp track_relevant_patches(
         %{advisory_type: AdvisoryType.enhancement()},
         %{
           software_enhancements: software_enhancements
         } = patches
       ),
       do: %{patches | software_enhancements: software_enhancements + 1}

  defp adapter, do: Application.fetch_env!(:trento, __MODULE__)[:adapter]

  defp commanded, do: Application.fetch_env!(:trento, Trento.Commanded)[:adapter]
end
