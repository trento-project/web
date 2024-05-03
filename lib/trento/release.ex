defmodule Trento.Release do
  @moduledoc """
  Used for executing DB release tasks when run in production without Mix
  installed.
  """

  alias Trento.ActivityLog.Settings, as: ActivityLogSettings
  alias Trento.Settings.ApiKeySettings

  @app :trento

  def init do
    migrate()
    init_event_store()
    migrate_event_store()
    init_admin_user()
    init_default_api_key()
    init_default_activity_log_retention_time()
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

  def init_admin_user do
    load_app()
    Enum.each([:postgrex, :ecto], &Application.ensure_all_started/1)
    Trento.Repo.start_link()

    admin_user = System.get_env("ADMIN_USER", "admin")
    admin_password = System.get_env("ADMIN_PASSWORD", "adminpassword")
    admin_email = System.get_env("ADMIN_EMAIL", "admin@trento.suse.com")

    %{id: admin_user_id} =
      %Trento.Users.User{}
      |> Trento.Users.User.changeset(%{
        username: admin_user,
        password: admin_password,
        confirm_password: admin_password,
        email: admin_email,
        enabled: true,
        fullname: "Trento Default Admin"
      })
      |> Trento.Repo.insert!(
        on_conflict: [set: [password_hash: Argon2.hash_pwd_salt(admin_password)]],
        conflict_target: :username
      )

    # Attach all:all ability
    %Trento.Abilities.UsersAbilities{}
    |> Trento.Abilities.UsersAbilities.changeset(%{user_id: admin_user_id, ability_id: 1})
    |> Trento.Repo.insert!(on_conflict: :nothing)
  end

  def init_default_api_key do
    load_app()
    Enum.each([:postgrex, :ecto], &Application.ensure_all_started/1)
    Trento.Repo.start_link()

    api_key_settings = Trento.Repo.one(ApiKeySettings.base_query())

    unless api_key_settings do
      %ApiKeySettings{}
      |> ApiKeySettings.changeset(%{
        jti: UUID.uuid4(),
        created_at: DateTime.utc_now()
      })
      |> Trento.Repo.insert!()
    end
  end

  def init_default_activity_log_retention_time do
    load_app()
    Enum.each([:postgrex, :ecto], &Application.ensure_all_started/1)
    Trento.Repo.start_link()

    Trento.Repo.insert!(ActivityLogSettings.with_default_retention_time(),
      on_conflict: :nothing,
      conflict_target: :type
    )
  end

  defp repos do
    Application.fetch_env!(@app, :ecto_repos)
  end

  defp load_app do
    Application.load(@app)
  end
end
