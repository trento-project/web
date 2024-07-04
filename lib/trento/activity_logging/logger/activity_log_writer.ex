defmodule Trento.ActivityLog.Logger.ActivityLogWriter do
  @moduledoc """
  Activity Log Writer behaviour
  """

  @type log_entry :: %{
          type: String.t(),
          actor: String.t(),
          metadata: map()
        }

  @callback write_log(log_entry()) :: {:ok, any()} | {:error, any()}

  def write_log(log_entry), do: adapter().write_log(log_entry)

  defp adapter, do: Application.fetch_env!(:trento, Trento.ActivityLog.ActivityLogger)[:writer]
end
