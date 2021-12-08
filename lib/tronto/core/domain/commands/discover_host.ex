defmodule Tronto.Core.Domain.Commands.DiscoverHost do
  @moduledoc false

  @type t :: %__MODULE__{}

  @enforce_keys [:id, :hostname]
  defstruct [:id, :hostname, :ip_addresses, :agent_version]
end
