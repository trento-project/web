defmodule Tronto.Monitoring.Domain.Commands.RegisterHost do
  @moduledoc """
    Register a host to the monitoring system.
  """

  use TypedStruct
  use Domo

  typedstruct do
    @typedoc "RegisterHost command"

    field :host_id, String.t(), enforce: true
    field :hostname, String.t(), enforce: true
    field :ip_addresses, [String.t()], enforce: true
    field :agent_version, String.t(), enforce: true
  end

  use Vex.Struct

  validates :host_id, uuid: true
end
