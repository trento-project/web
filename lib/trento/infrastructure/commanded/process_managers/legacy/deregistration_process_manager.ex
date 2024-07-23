defmodule Trento.DeregistrationProcessManager do
  @moduledoc """
  Legacy DeregistrationProcessManager module
  """

  def supersede,
    do: Trento.Infrastructure.Commanded.ProcessManagers.DeregistrationProcessManager
end
