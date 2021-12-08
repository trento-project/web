defmodule Tronto.Core.Domain.Events.HostDiscovered do
  @moduledoc false

  @type t :: %__MODULE__{}

  defstruct [:id, :hostname, :ip_addresses, :agent_version]
end
