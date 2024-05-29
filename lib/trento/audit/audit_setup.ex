defmodule Trento.Audit.AuditSetup do
  def create_events_publication() do
    {:ok, pid} = Postgrex.start_link(Trento.EventStore.config())

    query =
      Postgrex.prepare!(pid, "", "CREATE PUBLICATION eventstore_audit FOR TABLE events", [])

    Postgrex.execute!(pid, query, [])
  end

  def create_users_subscriptions() do
    {:ok, pid} = Postgrex.start_link(Trento.Repo.config())

    query =
      Postgrex.prepare!(pid, "", "CREATE PUBLICATION trento_repo_audit FOR TABLE users", [])

    Postgrex.execute!(pid, query, [])
  end
end
