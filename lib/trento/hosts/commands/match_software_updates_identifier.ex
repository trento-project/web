defmodule Trento.Hosts.Commands.MatchSoftwareUpdatesDiscoveryIdentifier do
  @moduledoc """
  Matches the host's software updates discovery identifier
  """

  @required_fields :all

  use Trento.Support.Command

  defcommand do
    field :host_id, Ecto.UUID
    field :software_updates_identifier, :string
  end
end
