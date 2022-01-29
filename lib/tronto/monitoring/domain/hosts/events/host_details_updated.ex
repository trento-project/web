defmodule Tronto.Monitoring.Domain.Events.HostDetailsUpdated do
  @moduledoc """
  This event is emitted when host details are updated.
  """

  use TypedStruct

  @derive Jason.Encoder
  typedstruct do
    @typedoc "HostDetailsUpdated event"

    field :host_id, String.t(), enforce: true
    field :hostname, String.t(), enforce: true
    field :ip_addresses, [String.t()], enforce: true
    field :agent_version, String.t(), enforce: true
  end
end
