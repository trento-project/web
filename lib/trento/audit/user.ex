defmodule Trento.Audit.User do
  use WalEx.Event, name: Trento.RepoAudit
  require Logger

  on_event(:all, fn event ->
    IO.inspect(on_insert: event)
    Logger.warning("Hello from CDC!")
  end)
end
