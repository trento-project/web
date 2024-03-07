defmodule Trento.Hosts.Commands.ClearSoftwareUpdatesDiscovery do
  @moduledoc """
  Clears the software updates discovery when its output is not needed anymore
  """

  @required_fields :all

  use Trento.Support.Command

  defcommand do
    field :host_id, Ecto.UUID
  end
end
