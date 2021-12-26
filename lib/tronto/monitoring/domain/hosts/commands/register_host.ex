defmodule Tronto.Monitoring.Domain.Commands.RegisterHost do
  @moduledoc """
    Register a host to the monitoring system.
  """

  use TypedStruct
  use Domo

  typedstruct do
    @typedoc "RegisterHost command"

    field :id_host, String.t(), enforce: true
    field :hostname, String.t(), enforce: true
    field :ip_addresses, [String.t()], enforce: true
    field :agent_version, String.t(), enforce: true
  end
end
