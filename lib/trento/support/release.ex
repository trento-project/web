defmodule Trento.Release do
  @moduledoc """
  Used for executing DB release tasks when run in production without Mix
  installed.
  """

  alias Pow.Ecto.Schema.Password

  @app :trento

  def init do
    migrate()
    init_event_store()
    migrate_event_store()
    init_grafana_dashboards()
    init_admin_user()
  end

  def migrate do
    load_app()

    for repo <- repos() do
      {:ok, _, _} = Ecto.Migrator.with_repo(repo, &Ecto.Migrator.run(&1, :up, all: true))
    end
  end

  def init_event_store do
    {:ok, _} = Application.ensure_all_started(:postgrex)
    {:ok, _} = Application.ensure_all_started(:ssl)

    load_app()

    config = Trento.EventStore.config()

    :ok = EventStore.Tasks.Init.exec(config, [])
  end

  def migrate_event_store do
    {:ok, _} = Application.ensure_all_started(:postgrex)
    {:ok, _} = Application.ensure_all_started(:ssl)

    load_app()

    config = Trento.EventStore.config()

    :ok = EventStore.Tasks.Migrate.exec(config, [])
  end

  def rollback(repo, version) do
    load_app()
    {:ok, _, _} = Ecto.Migrator.with_repo(repo, &Ecto.Migrator.run(&1, :down, to: version))
  end

  def dump_scenario(args) do
    load_app()

    Mix.Tasks.DumpScenario.run(args)
  end

  def prune_events(args) do
    load_app()

    Mix.Tasks.PruneEvents.run(args)
  end

  def init_grafana_dashboards do
    load_app()

    Mix.Tasks.InitGrafanaDashboards.run([])
  end

  def init_admin_user do
    load_app()
    Enum.each([:postgrex, :ecto], &Application.ensure_all_started/1)
    Trento.Repo.start_link()

    admin_user = System.get_env("ADMIN_USER", "admin")
    admin_password = System.get_env("ADMIN_PASSWORD", "adminpassword")

    %Trento.User{}
    |> Trento.User.changeset(%{
      username: admin_user,
      password: admin_password,
      confirm_password: admin_password
    })
    |> Trento.Repo.insert!(
      on_conflict: [set: [password_hash: Password.pbkdf2_hash(admin_password)]],
      conflict_target: :username
    )
  end

  defp repos do
    Application.fetch_env!(@app, :ecto_repos)
  end

  defp load_app do
    Application.load(@app)
  end
end
