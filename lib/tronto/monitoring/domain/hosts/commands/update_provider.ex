defmodule Tronto.Monitoring.Domain.Commands.UpdateProvider do
  @moduledoc """
  Update the provider to a specific host.
  """

  use TypedStruct
  use Domo

  typedstruct do
    @typedoc "UpdateProvider command"

    field :host_id, String.t(), enforce: true
    field :provider, String.t(), enforce: true
    field :provider_data, map
  end

  use Vex.Struct

  validates :host_id, uuid: true
end
