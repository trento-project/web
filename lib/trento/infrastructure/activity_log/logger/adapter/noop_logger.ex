defmodule Trento.Infrastructure.ActivityLog.Logger.NoopLogger do
  @moduledoc """
  Noop Activity Logger Adapter
  """

  @behaviour Trento.ActivityLog.ActivityLogger

  @impl true
  def log_activity(_), do: :ok
end
