defmodule Trento.ProcessManagers.DeregistrationState do
  @moduledoc """
    DeregistrationState represent the state of Deregistration process manager
  """

  @derive Jason.Encoder
  defstruct [
    :host_id
  ]
end
