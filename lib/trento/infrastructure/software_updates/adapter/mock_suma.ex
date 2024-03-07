defmodule Trento.Infrastructure.SoftwareUpdates.MockSuma do
  @moduledoc """
  Mocked SUMA Software updates discovery adapter
  """

  @behaviour Trento.SoftwareUpdates.Discovery.Gen

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
           advisory_type: "Bug Fix Advisory",
           advisory_status: "stable",
           id: 4182,
           advisory_synopsis: "Recommended update for cloud-netconfig",
           update_date: "2024-02-27"
         },
         %{
           date: "2024-02-26",
           advisory_name: "SUSE-15-SP4-2024-619",
           advisory_type: "Security Advisory",
           advisory_status: "stable",
           id: 4174,
           advisory_synopsis: "important: Security update for java-1_8_0-ibm",
           update_date: "2024-02-26"
         }
       ]}

  def clear, do: :ok
end
