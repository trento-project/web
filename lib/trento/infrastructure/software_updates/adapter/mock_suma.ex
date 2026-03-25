defmodule Trento.Infrastructure.SoftwareUpdates.MockSuma do
  @moduledoc """
  Mocked SUSE Multi-Linux Manager Software updates discovery adapter
  """

  @behaviour Trento.SoftwareUpdates.Discovery.Gen

  alias Trento.Support.StructHelper

  @impl true
  def setup, do: :ok

  @impl true
  def get_system_id(fully_qualified_domain_name),
    do:
      {:ok,
       fully_qualified_domain_name
       |> String.to_charlist()
       |> Enum.sum()}

  @impl true
  def get_relevant_patches(system_id) do
    if system_id in mocked_relevant_patches_system_ids() do
      {:ok,
       get_mock_data()
       |> Map.get("relevant_patches")
       |> Enum.map(fn patch ->
         patch
         |> StructHelper.to_atomized_map()
         |> Map.update!(:advisory_type, &String.to_existing_atom/1)
       end)}
    else
      {:error, :system_id_not_found}
    end
  end

  @impl true
  def get_upgradable_packages(system_id),
    do:
      (if system_id in mocked_relevant_patches_system_ids() do
         {:ok,
          get_mock_data()
          |> Map.get("upgradable_packages")
          |> Enum.map(&StructHelper.to_atomized_map/1)}
       else
         {:error, :system_id_not_found}
       end)

  @impl true
  def get_patches_for_package(_package_id),
    do:
      {:ok,
       get_mock_data()
       |> Map.get("relevant_patches")
       |> Enum.map(fn patch ->
         %{
           advisory: patch["advisory_name"],
           type: patch["advisory_type"],
           synopsis: patch["advisory_synopsis"],
           issue_date: patch["date"],
           update_date: patch["update_date"],
           last_modified_date: patch["update_date"]
         }
       end)}

  @impl true
  def get_errata_details(_advisory_name),
    do:
      {:ok,
       get_mock_data()
       |> Map.get("errata_details")
       |> StructHelper.to_atomized_map()}

  @impl true
  def get_affected_systems(_advisory_name),
    do:
      {:ok,
       get_mock_data()
       |> Map.get("affected_systems")
       |> Enum.map(&StructHelper.to_atomized_map/1)}

  @impl true
  def get_cves(_advisory_name),
    do: {:ok, Map.get(get_mock_data(), "cves")}

  @impl true
  def get_affected_packages(_advisory_name),
    do:
      {:ok,
       get_mock_data()
       |> Map.get("affected_packages")
       |> Enum.map(&StructHelper.to_atomized_map/1)}

  @impl true
  def get_bugzilla_fixes(_advisory_name),
    do:
      {:ok,
       get_mock_data()
       |> Map.get("bugzilla_fixes")
       |> StructHelper.to_atomized_map()}

  @impl true
  def clear, do: :ok

  defp mocked_relevant_patches_system_ids,
    do: Application.fetch_env!(:trento, __MODULE__)[:relevant_patches_system_ids]

  defp get_mock_data do
    :trento
    |> :code.priv_dir()
    |> Path.join("fixtures/software_updates.json")
    |> File.read!()
    |> Jason.decode!()
  end
end
