import Config

# config/runtime.exs is executed for all environments, including
# during releases. It is executed after compilation and before the
# system starts, so it is typically used to load production configuration
# and secrets from environment variables or elsewhere. Do not define
# any compile-time configuration in here, as it won't be applied.
# The block below contains prod specific runtime configuration.
if config_env() in [:prod, :demo] do
  admin_user = System.get_env("ADMIN_USER", "admin")

  config :trento,
    admin_user: admin_user

  database_url =
    System.get_env("DATABASE_URL") ||
      raise """
      environment variable DATABASE_URL is missing.
      For example: ecto://USER:PASS@HOST/DATABASE
      """

  config :trento, Trento.Repo,
    # ssl: true,
    # socket_options: [:inet6],
    url: database_url,
    pool_size: String.to_integer(System.get_env("DATABASE_POOL_SIZE") || "10")

  evenstore_url =
    System.get_env("EVENTSTORE_URL") ||
      raise """
      environment variable EVENTSTORE_URL is missing.
      For example: ecto://USER:PASS@HOST/DATABASE
      """

  config :trento, Trento.EventStore,
    url: evenstore_url,
    pool_size: String.to_integer(System.get_env("EVENTSTORE_POOL_SIZE") || "10")

  # The secret key base is used to sign/encrypt cookies and other secrets.
  # A default value is used in config/dev.exs and config/test.exs but you
  # want to use a different value for prod and you most likely don't want
  # to check this value into version control, so we use an environment
  # variable instead.
  secret_key_base =
    System.get_env("SECRET_KEY_BASE") ||
      raise """
      environment variable SECRET_KEY_BASE is missing.
      You can generate one by calling: mix phx.gen.secret
      """

  config :joken,
    access_token_signer:
      System.get_env("ACCESS_TOKEN_ENC_SECRET") ||
        raise("""
        environment variable ACCESS_TOKEN_ENC_SECRET is missing.
        You can generate one by calling: mix phx.gen.secret
        """),
    refresh_token_signer:
      System.get_env("REFRESH_TOKEN_ENC_SECRET") ||
        raise("""
        environment variable REFRESH_TOKEN_ENC_SECRET is missing.
        You can generate one by calling: mix phx.gen.secret
        """)

  trento_origin =
    System.get_env("TRENTO_WEB_ORIGIN") ||
      raise """
      environment variable TRENTO_WEB_ORIGIN is missing.
      For example: yourdomain.example.com
      """

  # Returns an IP address to bind the HTTP server, based on IPv6 support.
  # This prevents startup failures on systems without IPv6 where the app would crash
  # Falls back to IPv4 `{0, 0, 0, 0}` if IPv6 is not available.
  ip =
    case :inet.getaddr(~c"localhost", :inet6) do
      {:ok, _addr} -> {0, 0, 0, 0, 0, 0, 0, 0}
      {:error, _} -> {0, 0, 0, 0}
    end

  config :trento, TrentoWeb.Endpoint,
    http: [
      # Enable IPv6 and bind on all interfaces.
      # Set it to  {0, 0, 0, 0, 0, 0, 0, 1} for local network only access.
      # See the documentation on https://hexdocs.pm/plug_cowboy/Plug.Cowboy.html
      # for details about using IPv6 vs IPv4 and loopback vs public addresses.
      ip: ip,
      port: String.to_integer(System.get_env("PORT") || "4000")
    ],
    check_origin: true,
    url: [host: trento_origin],
    secret_key_base: secret_key_base

  amqp_url =
    System.get_env("AMQP_URL") ||
      raise """
      environment variable AMQP_URL is missing.
      For example: amqp://USER:PASSWORD@HOST
      """

  config :trento, Trento.Infrastructure.Messaging.Adapter.AMQP,
    checks: [
      consumer: [
        connection: amqp_url
      ],
      publisher: [
        connection: amqp_url
      ]
    ],
    operations: [
      consumer: [
        connection: amqp_url
      ],
      publisher: [
        connection: amqp_url
      ]
    ],
    catalog: [
      consumer: [
        connection: amqp_url
      ]
    ],
    discoveries: [
      publisher: [
        connection: amqp_url
      ]
    ]

  config :trento, :checks_service, base_url: System.get_env("CHECKS_SERVICE_BASE_URL") || ""

  config :trento, Trento.Infrastructure.Prometheus.PrometheusApi,
    url: System.get_env("PROMETHEUS_URL") || "http://localhost:9090"

  config :trento, Trento.Charts, enabled: System.get_env("CHARTS_ENABLED", "true") == "true"

  # ## Using releases
  #
  # If you are doing OTP releases, you need to instruct Phoenix
  # to start each relevant endpoint:
  #
  #     config :trento, TrentoWeb.Endpoint, server: true
  #
  # Then you can assemble a release by calling `mix release`.
  # See `mix help release` for more information.

  # ## Configuring the mailer
  #
  # In production you need to configure the mailer to use a different adapter.
  # Also, you may need to configure the Swoosh API client of your choice if you
  # are not using SMTP. Here is an example of the configuration:
  #
  #     config :trento, Trento.Mailer,
  #       adapter: Swoosh.Adapters.Mailgun,
  #       api_key: System.get_env("MAILGUN_API_KEY"),
  #       domain: System.get_env("MAILGUN_DOMAIN")
  #
  # For this example you need include a HTTP client required by Swoosh API client.
  # Swoosh supports Hackney and Finch out of the box:
  #
  #     config :swoosh, :api_client, Swoosh.ApiClient.Hackney
  #
  # See https://hexdocs.pm/swoosh/Swoosh.html#module-installation for details.

  config :trento, :alerting,
    enabled:
      (case System.get_env("ENABLE_ALERTING") do
         nil -> nil
         "true" -> true
         _ -> false
       end),
    smtp_server: System.get_env("SMTP_SERVER"),
    smtp_port:
      (case Integer.parse(System.get_env("SMTP_PORT", "")) do
         :error -> nil
         {number, _} -> number
       end),
    smtp_username: System.get_env("SMTP_USER"),
    smtp_password: System.get_env("SMTP_PASSWORD"),
    sender_email: System.get_env("ALERT_SENDER"),
    recipient_email: System.get_env("ALERT_RECIPIENT")

  :ok = :public_key.cacerts_load()
  [_ | _] = cacerts = :public_key.cacerts_get()

  config :trento, Trento.Mailer,
    adapter: Swoosh.Adapters.SMTP,
    # `relay`, `port`, `username` and `password` would be supplied
    # dynamically during runtime and would be derived from values
    # specified in the :alerting key.
    auth: :if_available,
    ssl: false,
    tls: :if_available,
    tls_options: [
      versions: [:"tlsv1.2", :"tlsv1.3"],
      cacerts: cacerts,
      # `server_name_indication` would be supplied dynamically during
      # runtime and would be derived from values
      # specified in the :alerting key.
      depth: 99
    ]

  config :trento, Trento.Scheduler,
    jobs: [
      # Runs every five minutes by default
      clusters_checks_execution: [
        schedule: "*/#{System.get_env("CHECKS_INTERVAL", "5")} * * * *"
      ],
      hosts_checks_execution: [
        schedule: "*/#{System.get_env("CHECKS_INTERVAL", "5")} * * * *"
      ]
    ]

  config :trento,
    api_key_authentication_enabled: System.get_env("ENABLE_API_KEY", "true") == "true"

  config :trento, Trento.Vault,
    ciphers: [
      default: {
        Cloak.Ciphers.AES.GCM,
        tag: "AES.GCM.V1",
        key: secret_key_base |> Base.decode64!() |> :binary.part({0, 32}),
        iv_length: 12
      }
    ]

  enable_oidc = System.get_env("ENABLE_OIDC", "false") == "true"
  enable_oauth2 = System.get_env("ENABLE_OAUTH2", "false") == "true"
  enable_saml = System.get_env("ENABLE_SAML", "false") == "true"

  if Enum.count([enable_oidc, enable_oauth2, enable_saml], fn enabled -> enabled end) > 1 do
    raise(
      "Cannot start Trento with multiple SSO options enabled. Use one among: OIDC, OAUTH2 and SAML."
    )
  end

  config :trento, :oidc,
    enabled: enable_oidc,
    callback_url:
      System.get_env(
        "OIDC_CALLBACK_URL",
        "https://#{System.get_env("TRENTO_WEB_ORIGIN")}/auth/oidc_callback"
      )

  config :trento, :oauth2,
    enabled: enable_oauth2,
    callback_url:
      System.get_env(
        "OAUTH2_CALLBACK_URL",
        "https://#{System.get_env("TRENTO_WEB_ORIGIN")}/auth/oauth2_callback"
      )

  if enable_oauth2 do
    config :trento, :pow_assent,
      providers: [
        oauth2_local: [
          client_id:
            System.get_env("OAUTH2_CLIENT_ID") ||
              raise("environment variable OAUTH2_CLIENT_ID is missing"),
          client_secret:
            System.get_env("OAUTH2_CLIENT_SECRET") ||
              raise("environment variable OAUTH2_CLIENT_SECRET is missing"),
          base_url:
            System.get_env("OAUTH2_BASE_URL") ||
              raise("environment variable OAUTH2_BASE_URL is missing"),
          authorize_url:
            System.get_env("OAUTH2_AUTHORIZE_URL") ||
              raise("environment variable OAUTH2_AUTHORIZE_URL is missing"),
          token_url:
            System.get_env("OAUTH2_TOKEN_URL") ||
              raise("environment variable OAUTH2_TOKEN_URL is missing"),
          user_url:
            System.get_env("OAUTH2_USER_URL") ||
              raise("environment variable OAUTH2_USER_URL is missing"),
          strategy: Assent.Strategy.OAuth2,
          auth_method: :client_secret_post,
          authorization_params: [
            scope: System.get_env("OAUTH2_SCOPES", "profile email")
          ]
        ]
      ]
  end

  if enable_oidc do
    config :trento, :pow_assent,
      providers: [
        oidc_local: [
          client_id:
            System.get_env("OIDC_CLIENT_ID") ||
              raise("environment variable OIDC_CLIENT_ID is missing"),
          client_secret:
            System.get_env("OIDC_CLIENT_SECRET") ||
              raise("environment variable OIDC_CLIENT_SECRET is missing"),
          base_url:
            System.get_env("OIDC_BASE_URL") ||
              raise("environment variable OIDC_BASE_URL is missing"),
          strategy: Assent.Strategy.OIDC,
          authorization_params: [scope: "openid profile"]
        ]
      ]
  end

  if enable_saml do
    saml_dir = System.get_env("SAML_SP_DIR", "/etc/trento/saml")

    config :trento, :saml,
      enabled: true,
      callback_url: "/auth/saml_callback",
      idp_id:
        System.get_env("SAML_IDP_ID") ||
          raise("environment variable SAML_IDP_ID is missing"),
      user_profile_attributes: %{
        username_field: System.get_env("SAML_USERNAME_ATTR_NAME", "username"),
        email_field: System.get_env("SAML_EMAIL_ATTR_NAME", "email"),
        first_name_field: System.get_env("SAML_FIRSTNAME_ATTR_NAME", "firstName"),
        last_name_field: System.get_env("SAML_LASTNAME_ATTR_NAME", "lastName")
      }

    config :trento, :pow_assent,
      providers: [
        saml_local: [
          strategy: TrentoWeb.Auth.AssentSamlStrategy
        ]
      ]

    config :samly, Samly.Provider,
      idp_id_from: :path_segment,
      service_providers: [
        %{
          id:
            System.get_env("SAML_SP_ID") ||
              raise("environment variable SAML_SP_ID is missing"),
          entity_id: System.get_env("SAML_SP_ENTITY_ID", ""),
          certfile: Path.join([saml_dir, "cert", "saml.pem"]),
          keyfile: Path.join([saml_dir, "cert", "saml_key.pem"]),
          contact_name: System.get_env("SAML_SP_CONTACT_NAME", "Trento SP Admin"),
          contact_email: System.get_env("SAML_SP_CONTACT_EMAIL", "admin@trento.suse.com"),
          org_name: System.get_env("SAML_SP_ORG_NAME", "Trento SP"),
          org_displayname: System.get_env("SAML_SP_ORG_DISPLAYNAME", "SAML SP build with Trento"),
          org_url: System.get_env("SAML_SP_ORG_URL", "https://www.trento-project.io/")
        }
      ],
      identity_providers: [
        %{
          id: System.get_env("SAML_IDP_ID"),
          sp_id: System.get_env("SAML_SP_ID"),
          base_url: "https://#{System.get_env("TRENTO_WEB_ORIGIN")}/sso",
          metadata_file: Path.join([saml_dir, "metadata.xml"]),
          sign_requests: System.get_env("SAML_SIGN_REQUESTS", "true") == "true",
          sign_metadata: System.get_env("SAML_SIGN_METADATA", "true") == "true",
          signed_assertion_in_resp: System.get_env("SAML_SIGNED_ASSERTION", "true") == "true",
          signed_envelopes_in_resp: System.get_env("SAML_SIGNED_ENVELOPES", "true") == "true",
          nameid_format:
            System.get_env(
              "SAML_IDP_NAMEID_FORMAT",
              "urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified"
            )
        }
      ]
  end
end
