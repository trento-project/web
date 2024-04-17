defmodule Trento.Hosts.Commands.CompleteSoftwareUpdatesDiscovery do
  @moduledoc """
  Complete the software updates discovery with the detected info
  """

  require Trento.SoftwareUpdates.Enums.SoftwareUpdatesHealth, as: SoftwareUpdatesHealth

  @required_fields :all

  use Trento.Support.Command

  defcommand do
    field :host_id, Ecto.UUID
    field :health, Ecto.Enum, values: SoftwareUpdatesHealth.values()
  end
end
