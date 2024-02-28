defmodule Trento.Hosts.Commands.CompleteSoftwareUpdatesDiscovery do
  @moduledoc """
  Complete the software updates discovery with the detected info
  """

  alias Trento.Hosts.ValueObjects.RelevantPatches

  @required_fields :all

  use Trento.Support.Command

  defcommand do
    field :host_id, Ecto.UUID
    embeds_one :relevant_patches, RelevantPatches
  end
end
