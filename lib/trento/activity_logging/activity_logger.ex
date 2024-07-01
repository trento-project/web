defmodule Trento.ActivityLog.ActivityLogger do
  @moduledoc """
  ActivityLogger entry point
  """

  @callback log_activity(context :: any()) :: :ok

  def log_activity(context), do: adapter().log_activity(context)

  defp adapter, do: Application.fetch_env!(:trento, __MODULE__)[:adapter]
end
