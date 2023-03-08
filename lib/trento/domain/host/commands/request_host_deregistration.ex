defmodule Trento.Domain.Host.Commands.RequestHostDeregistration do
  @moduledoc """
    Request a deregistration of a host
  """
  use Trento.Command

  @required_fields :all

  defcommand do
    field :host_id, Ecto.UUID
  end
end
