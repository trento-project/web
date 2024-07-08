defmodule Trento.Infrastructure.ActivityLog.Logger.DatabasetWriter do
  @moduledoc """
  Persistent Activity Log Writer Adapter
  """

  alias Trento.Repo

  alias Trento.ActivityLog.ActivityLog

  @behaviour Trento.ActivityLog.Logger.ActivityLogWriter

  @impl true
  def write_log(log_entry),
    do:
      %ActivityLog{}
      |> ActivityLog.changeset(log_entry)
      |> Repo.insert()
end
