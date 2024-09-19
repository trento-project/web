defmodule Trento.Release do
  @moduledoc """
  Used for executing DB release tasks when run in production without Mix
  installed.
  """

  alias Mix.Tasks.Phx.Gen.Cert

  alias Trento.ActivityLog.Settings, as: ActivityLogSettings
  alias Trento.Settings.ApiKeySettings
  alias Trento.Settings.CertificatesSettings

  @app :trento

  @saml_certificate_name "Trento SAML SP"

  def init do
    migrate()
    init_event_store()
    migrate_event_store()
    init_admin_user()
    init_default_api_key()
    init_default_activity_log_retention_time()
    maybe_init_saml(System.get_env("ENABLE_SAML", "false") == "true")
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

  def maybe_init_saml(false), do: :ok

  def maybe_init_saml(true) do
    load_app()
    Enum.each([:postgrex, :ecto, :httpoison], &Application.ensure_all_started/1)
    Trento.Repo.start_link()
    Trento.Vault.start_link()

    trento_origin =
      System.get_env("TRENTO_WEB_ORIGIN") ||
        raise """
        environment variable TRENTO_WEB_ORIGIN is missing.
        For example: yourdomain.example.com
        """

    saml_dir = System.get_env("SAML_SP_DIR", "/etc/trento/trento-web/saml")

    certificates_settings =
      Trento.Repo.get_by(CertificatesSettings.base_query(), name: @saml_certificate_name)

    {key_file, cert_file} =
      case certificates_settings do
        nil ->
          {key, cert} =
            create_certificates_content(
              @saml_certificate_name,
              [trento_origin]
            )

          %CertificatesSettings{}
          |> CertificatesSettings.changeset(%{
            name: @saml_certificate_name,
            key_file: key,
            certificate_file: cert
          })
          |> Trento.Repo.insert!()

          {key, cert}

        %CertificatesSettings{key_file: key, certificate_file: cert} ->
          {key, cert}
      end

    File.mkdir_p!(Path.join([saml_dir, "cert"]))
    File.write!(Path.join([saml_dir, "cert", "saml_key.pem"]), key_file)
    File.write!(Path.join([saml_dir, "cert", "saml.pem"]), cert_file)

    IO.puts(IO.ANSI.green() <> "Created certificate content:\n\n#{cert_file}")

    # Create metadata.xml file
    case get_saml_metadata_file(System.get_env()) do
      {:ok, content} ->
        File.write!(Path.join([saml_dir, "metadata.xml"]), content)

      {:error, :request_failure} ->
        raise "Error querying the provided SAML_METADATA_URL endpoint"

      {:error, :metadata_is_missing} ->
        raise "One of SAML_METADATA_URL or SAML_METADATA_CONTENT must be provided"
    end

    :ok
  end

  defp repos do
    Application.fetch_env!(@app, :ecto_repos)
  end

  defp load_app do
    Application.load(@app)
  end

  defp create_certificates_content(name, hostnames) do
    {certificate, private_key} = Cert.certificate_and_key(2048, name, hostnames)

    keyfile_content =
      :public_key.pem_encode([:public_key.pem_entry_encode(:RSAPrivateKey, private_key)])

    certfile_content = :public_key.pem_encode([{:Certificate, certificate, :not_encrypted}])

    {keyfile_content, certfile_content}
  end

  defp get_saml_metadata_file(%{"SAML_METADATA_URL" => metadata_url}) when metadata_url != "" do
    case HTTPoison.get(metadata_url) do
      {:ok, %HTTPoison.Response{status_code: 200, body: body}} ->
        {:ok, body}

      {:ok, _} ->
        {:error, :request_failure}

      {:error, _} ->
        {:error, :request_failure}
    end
  end

  defp get_saml_metadata_file(%{"SAML_METADATA_CONTENT" => metadata_content})
       when metadata_content != "" do
    {:ok, metadata_content}
  end

  defp get_saml_metadata_file(_) do
    {:error, :metadata_is_missing}
  end
end
