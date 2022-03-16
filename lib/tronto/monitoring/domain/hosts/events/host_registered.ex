defmodule Tronto.Monitoring.Domain.Events.HostRegistered do
  @moduledoc """
  This event is emitted when a host is registered.
  """

  use TypedStruct

  @derive Jason.Encoder
  typedstruct do
    @typedoc "HostRegistered event"

    field :host_id, String.t(), enforce: true
    field :hostname, String.t(), enforce: true
    field :ip_addresses, [String.t()], enforce: true
    field :agent_version, String.t(), enforce: true
    field :cpu_count, non_neg_integer(), enforce: true
    field :total_memory_mb, non_neg_integer(), enforce: true
    field :socket_count, non_neg_integer(), enforce: true
    field :os_version, String.t(), enforce: true
    field :heartbeat, :unknown, enforce: true, default: :unknown
  end
end
