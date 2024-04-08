defmodule Trento.Hosts.Commands.DiscoverSoftwareUpdates do
  @moduledoc """
  Issues the software updates discovery for a host
  """

  @required_fields :all

  use Trento.Support.Command

  defcommand do
    field :host_id, Ecto.UUID
  end
end
