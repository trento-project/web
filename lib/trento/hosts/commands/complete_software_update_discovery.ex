defmodule Trento.Hosts.Commands.CompleteSoftwareUpdateDiscovery do
  @moduledoc """
  Complete the software updates discovery with the detected result
  """

  @required_fields :all

  use Trento.Support.Command

  defcommand do
    field :host_id, Ecto.UUID
    field :relevant_patches, :integer
    field :upgradable_packages, :integer

    embeds_one :patches_details, PatchesDetails do
      field :security_advisories, :integer, default: 0
      field :bug_fixes, :integer, default: 0
      field :software_enhancements, :integer, default: 0
    end
  end
end
