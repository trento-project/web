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
  def get_relevant_patches(_system_id),
    do:
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
  def clear, do: :ok
end
