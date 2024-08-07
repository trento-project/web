defmodule Trento.DeregistrationProcessManager do
  @moduledoc """
  Legacy DeregistrationProcessManager module
  """

  def superseded_by,
    do: Trento.Infrastructure.Commanded.ProcessManagers.DeregistrationProcessManager
end
