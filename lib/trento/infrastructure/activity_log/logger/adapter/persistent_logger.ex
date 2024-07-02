defmodule Trento.Infrastructure.ActivityLog.Logger.PersistentLogger do
  @moduledoc """
  Persistent Activity Logger Adapter
  """

  @behaviour Trento.ActivityLog.ActivityLogger

  @impl true
  def log_activity(_activity) do
    :ok
  end
end
