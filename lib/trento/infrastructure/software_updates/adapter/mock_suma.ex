defmodule Trento.Infrastructure.SoftwareUpdates.MockSuma do
  @moduledoc """
  Mocked SUMA Software updates discovery adapter
  """

  @behaviour Trento.SoftwareUpdates.Discovery.Gen

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
       [
         %{
           date: "2024-02-27",
           advisory_name: "SUSE-15-SP4-2024-630",
           advisory_type: :bugfix,
           advisory_status: "stable",
           id: 4182,
           advisory_synopsis: "Recommended update for cloud-netconfig",
           update_date: "2024-02-27"
         },
         %{
           date: "2024-02-26",
           advisory_name: "SUSE-15-SP4-2024-619",
           advisory_type: :security_advisory,
           advisory_status: "stable",
           id: 4174,
           advisory_synopsis: "important: Security update for java-1_8_0-ibm",
           update_date: "2024-02-26"
         }
       ]}
    else
      {:ok, []}
    end
  end

  @impl true
  def get_upgradable_packages(_system_id),
    do:
      {:ok,
       [
         %{
           name: "elixir",
           arch: "x86_64",
           from_version: "1.15.7",
           from_release: "3",
           from_epoch: "0",
           to_version: "1.16.2",
           to_release: "1",
           to_epoch: "0",
           to_package_id: "92348112636"
         },
         %{
           name: "systemd",
           arch: "x86_64",
           from_version: "254",
           from_release: "1",
           from_epoch: "",
           to_version: "255",
           to_release: "1",
           to_epoch: "0",
           to_package_id: "8912349843"
         }
       ]}

  @impl true
  def get_patches_for_package(_package_id),
    do:
      {:ok,
       [
         %{
           advisory: "SUSE-15-SP4-2024-630",
           type: "bugfix",
           synopsis: "Recommended update for cloud-netconfig",
           issue_date: "2024-02-27",
           update_date: "2024-02-27",
           last_modified_date: "2024-02-27"
         },
         %{
           advisory: "SUSE-15-SP4-2024-619",
           type: "security_advisory",
           synopsis: "important: Security update for java-1_8_0-ibm",
           issue_date: "2024-02-27",
           update_date: "2024-02-27",
           last_modified_date: "2024-02-27"
         }
       ]}

  @impl true
  def get_errata_details(_advisory_name),
    do:
      {:ok,
       %{
         type: "security_advisory",
         synopsis: "important: Security update for java-1_8_0-ibm",
         issue_date: "2024-02-27",
         update_date: "2024-02-27",
         last_modified_date: "2024-02-27",
         advisory_status: "stable",
         reboot_suggested: true,
         restart_suggested: true
       }}

  @impl true
  def get_affected_systems(_advisory_name),
    do:
      {:ok,
       [
         %{
           name: "test"
         },
         %{name: "test2"}
       ]}

  @impl true
  def get_cves(_advisory_name),
    do:
      {:ok,
       [
         "SUSE-15-SP4-2024-630",
         "SUSE-15-SP4-2024-234",
         "SUSE-15-SP4-2024-990"
       ]}

  @impl true
  def get_affected_packages(_advisory_name),
    do:
      {:ok,
       [
         %{
           name: "kernel",
           version: "6.9.7",
           release: "2",
           arch_label: "x86_64",
           epoch: "0"
         }
       ]}

  @impl true
  def get_bugzilla_fixes(_advisory_name),
    do:
      {:ok,
       %{
         "1210660": "VUL-0: CVE-2023-2137: sqlite2,sqlite3: Heap buffer overflow in sqlite"
       }}

  @impl true
  def clear, do: :ok

  defp mocked_relevant_patches_system_ids,
    do: Application.fetch_env!(:trento, __MODULE__)[:relevant_patches_system_ids]
end
