defmodule Tronto.Core.Domain.Events.HostUpdated do
  @moduledoc false

  @type t :: %__MODULE__{}

  defstruct [:id, :hostname, :ip_addresses, :agent_version]
end
