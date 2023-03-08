defmodule Trento.Domain.Host.Commands.RequestHostDeregistration do
  @moduledoc """
    Request a deregistration of a host
  """
  @required_fields :all

  use Trento.Command

  defcommand do
    field :host_id, Ecto.UUID
  end
end
