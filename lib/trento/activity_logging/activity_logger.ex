defmodule Trento.ActivityLog.ActivityLogger do
  @moduledoc """
  ActivityLogger entry point
  """

  @callback log_activity(activity_context :: any()) :: :ok

  def log_activity(activity_context), do: adapter().log_activity(activity_context)

  defp adapter, do: Application.fetch_env!(:trento, __MODULE__)[:adapter]
end
