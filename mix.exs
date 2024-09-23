defmodule Trento.MixProject do
  use Mix.Project

  @source_url "https://github.com/trento-project/web"
  @version "2.3.2"

  def project do
    [
      app: :trento,
      description: "Easing your life in administering SAP applications",
      version: get_version(),
      elixir: "~> 1.15",
      elixirc_paths: elixirc_paths(Mix.env()),
      compilers: Mix.compilers(),
      start_permanent: Mix.env() == :prod,
      aliases: aliases(),
      deps: deps(),
      name: "Trento Web",
      docs: docs(),
      test_coverage: [tool: ExCoveralls],
      preferred_cli_env: [
        coveralls: :test,
        "coveralls.github": :test
      ],
      dialyzer: [
        plt_add_apps: [:ex_unit, :mix]
        # check_plt: true,
        # ignore_warnings: "dialyzer_ignore.exs"
      ]
    ]
  end

  # Configuration for the OTP application.
  #
  # Type `mix help compile.app` for more information.
  def application do
    [
      mod: {Trento.Application, []},
      extra_applications: [:logger, :runtime_tools]
    ]
  end

  # Specifies which paths to compile per environment.
  defp elixirc_paths(:test),
    do: [
      "lib",
      "test/support"
    ]

  defp elixirc_paths(_), do: ["lib"]

  # Specifies your project dependencies.
  #
  # Type `mix help deps` for examples and options.
  defp deps do
    [
      {:commanded, "~> 1.4"},
      {:commanded_ecto_projections, "~> 1.3"},
      {:commanded_eventstore_adapter, "~> 1.4"},
      {:cloak, "~> 1.1.2"},
      {:cloak_ecto, "~> 1.2.0"},
      {:credo, "~> 1.6", only: [:dev, :test], runtime: false},
      {:dialyxir, "~> 1.0", only: [:dev, :test], runtime: false},
      {:ecto_sql, "~> 3.11"},
      {:esbuild, "~> 0.2", runtime: Mix.env() == :dev},
      {:eventstore, "~> 1.1",
       [env: :prod, git: "https://github.com/commanded/eventstore.git", override: true]},
      # {:eventstore_dashboard, github: "commanded/eventstore-dashboard"},
      {:ex_doc, "~> 0.29", only: [:dev, :test], runtime: false},
      {:ex_machina, "~> 2.7.0", only: :test},
      {:excoveralls, "~> 0.10", only: :test},
      {:faker, "~> 0.17", only: [:dev, :test]},
      {:flop, "~> 0.25.0"},
      {:floki, ">= 0.36.2", only: :test},
      {:fun_with_flags, "~> 1.8.1"},
      {:fun_with_flags_ui, "~> 0.8.0"},
      {:gettext, "~> 0.18"},
      {:gen_smtp, "~> 1.2.0"},
      # project has been archived by its github maintainer
      {:gen_rmq, "~> 4.0"},
      {:httpoison, "~> 2.0"},
      {:jason, "~> 1.2"},
      {:mox, "~> 1.0", only: :test},
      {:open_api_spex, "~> 3.19.1"},
      {:phoenix, "~> 1.7.14"},
      {:phoenix_ecto, "~> 4.5"},
      {:phoenix_html, "~> 4.1"},
      {:phoenix_live_dashboard, "~> 0.8.4"},
      {:phoenix_live_reload, "~> 1.2", only: [:dev, :wanda]},
      {:phoenix_live_view, "~> 0.20.17"},
      {:phoenix_swoosh, "~> 1.0"},
      {:plug_cowboy, "~> 2.5"},
      {:postgrex, ">= 0.0.0"},
      {:pow, "~> 1.0.38"},
      {:quantum, ">= 1.8.0"},
      {:swoosh, "~> 1.3"},
      {:telemetry_metrics, "~> 0.6"},
      {:telemetry_poller, "~> 1.0"},
      {:timex, "~> 3.7.7"},
      {:trento_contracts,
       github: "trento-project/contracts",
       ref: "95ed2147fa9d2dafe79139013d5a43d26f92049b",
       sparse: "elixir"},
      {:unplug, "~> 1.0.0"},
      {:proper_case, "~> 1.3.1"},
      {:polymorphic_embed, "~> 4.1"},
      {:joken, "~> 2.5.0"},
      # required overrides to upgrade to elixir 1.15.7 and erlang otp 26
      # https://stackoverflow.com/questions/76562092/hi-i-had-created-elixir-project-with-phoenix-framework-there-is-yaml-file-when
      {:ecto, "~> 3.10", override: true},
      # https://github.com/deadtrickster/ssl_verify_fun.erl/pull/27
      {:ssl_verify_fun, "~> 1.1", manager: :rebar3, override: true},
      {:parallel_stream, "~> 1.1.0"},
      {:x509, "~> 0.8.8"},
      {:argon2_elixir, "~> 4.0"},
      {:ecto_commons, "~> 0.3.4"},
      {:bodyguard, "~> 2.4"},
      {:nimble_totp, "~> 1.0"},
      {:nimble_parsec, "~> 1.0"},
      {:phoenix_view, "~> 2.0"},
      {:phoenix_html_helpers, "~> 1.0"},
      {:pow_assent, "~> 0.4.18"},
      {:samly, "~> 1.0"}
    ]
  end

  # Aliases are shortcuts or tasks specific to the current project.
  # For example, to install project dependencies and perform other setup tasks, run:
  #
  #     $ mix setup
  #
  # See the documentation for `Mix` for more info on aliases.
  defp aliases do
    [
      start: [
        "cmd docker-compose up -d",
        "deps.get",
        "ecto.create",
        "ecto.migrate",
        "event_store.setup",
        "phx.server"
      ],
      setup: ["deps.get", "event_store.setup", "ecto.setup"],
      "ecto.setup": ["ecto.create", "ecto.migrate", "run priv/repo/seeds.exs"],
      "ecto.reset": ["ecto.drop", "ecto.setup"],
      "event_store.setup": ["event_store.create", "event_store.init"],
      "event_store.reset": ["event_store.drop", "event_store.setup"],
      test: [
        "ecto.create --quiet",
        "ecto.migrate --quiet",
        "event_store.create --quiet",
        "event_store.init --quiet",
        "test"
      ],
      "coveralls.github": [
        "ecto.create --quiet",
        "ecto.migrate --quiet",
        "event_store.create --quiet",
        "event_store.init --quiet",
        "coveralls.github"
      ],
      "assets.deploy": [
        "cmd --cd assets npm run tailwind:build",
        "cmd --cd assets npm run build",
        "phx.digest"
      ]
    ]
  end

  defp docs do
    [
      main: "readme",
      logo: "priv/static/images/trento.svg",
      extra_section: "GUIDES",
      source_url: @source_url,
      assets: "guides/assets/",
      extras: extras(),
      groups_for_extras: groups_for_extras(),
      groups_for_modules: [
        Clusters: [~r/Trento.Clusters.*/],
        Hosts: [~r/Trento.Hosts.*/],
        SapSystems: [~r/Trento.SapSystems.*/],
        Discovery: [~r/Trento.Discovery.*/],
        Enums: [~r/Trento.Enums.*/],
        Services: [~r/Trento.Services.*/],
        "Event handlers": [~r/Trento.*EventHandler$/],
        Infrastructure: [~r/Trento.Infrastructure.*/],
        Support: [~r/Trento.Support.*/],
        Web: [~r/TrentoWeb.*/],
        "Legacy events": [~r/Trento.Domain.Events.*/]
      ],
      nest_modules_by_prefix: [
        Trento.Clusters,
        Trento.Clusters.Commands,
        Trento.Clusters.Enums,
        Trento.Clusters.Events,
        Trento.Clusters.Projections,
        Trento.Clusters.ValueObjects,
        Trento.Hosts,
        Trento.Hosts.Commands,
        Trento.Hosts.Events,
        Trento.Hosts.Projections,
        Trento.Hosts.ValueObjects,
        Trento.SapSystems,
        Trento.SapSystems.Commands,
        Trento.SapSystems.Enums,
        Trento.SapSystems.Events,
        Trento.SapSystems.Projections,
        Trento.SapSystems.Services,
        Trento.Infrastructure.Checks,
        Trento.Discovery.Payloads,
        Trento.Discovery.Policies,
        Trento.Domain.Events
      ]
    ]
  end

  def extras() do
    [
      "README.md",
      "CHANGELOG.md",
      "CONTRIBUTING.md",
      "guides/monitoring/monitoring.md",
      "guides/alerting/alerting.md",
      "guides/development/environment_variables.md",
      "guides/development/hack_on_the_trento.md"
    ] ++ Path.wildcard("guides/authentication/*.md")
  end

  defp groups_for_extras do
    [
      Development: [~r/guides\/development\/.?/, "CONTRIBUTING.md"],
      Authentication: [~r/guides\/authentication\/.?/]
    ]
  end

  defp get_version, do: System.get_env("VERSION", get_version_from_git())

  defp get_version_from_git do
    case File.cwd!() |> Path.join("hack/get_version_from_git.sh") |> System.cmd([]) do
      {version, 0} -> version |> String.trim("\n")
      _ -> @version
    end
  end
end
