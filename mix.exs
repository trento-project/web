defmodule Trento.MixProject do
  use Mix.Project

  @version "1.1.0"

  def project do
    [
      app: :trento,
      description: "Easing your life in administering SAP applications",
      version: get_version(),
      elixir: "~> 1.13",
      elixirc_paths: elixirc_paths(Mix.env()),
      compilers: Mix.compilers(),
      start_permanent: Mix.env() == :prod,
      aliases: aliases(),
      deps: deps(),
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
      {:commanded, "~> 1.3"},
      {:commanded_ecto_projections, "~> 1.2"},
      {:commanded_eventstore_adapter, "~> 1.2"},
      # this is pinned since the 3.1.0 version requires OTP 23.2
      # overrides gen_rmq dependency
      {:credentials_obfuscation, "3.0.0", override: true},
      {:credo, "~> 1.6", only: [:dev, :test], runtime: false},
      {:dialyxir, "~> 1.0", only: [:dev, :test], runtime: false},
      {:ecto_sql, "~> 3.6"},
      {:esbuild, "~> 0.2", runtime: Mix.env() == :dev},
      {:eventstore, "~> 1.1",
       [env: :prod, git: "https://github.com/commanded/eventstore.git", override: true]},
      {:eventstore_dashboard, github: "commanded/eventstore-dashboard"},
      {:ex_machina, "~> 2.7.0", only: :test},
      {:faker, "~> 0.17", only: [:dev, :test]},
      {:floki, ">= 0.30.0", only: :test},
      {:fun_with_flags, "~> 1.8.1"},
      {:fun_with_flags_ui, "~> 0.8.0"},
      {:gettext, "~> 0.18"},
      {:gen_smtp, "~> 1.2.0"},
      {:gen_rmq, "~> 4.0"},
      {:httpoison, "~> 1.8"},
      {:jason, "~> 1.2"},
      {:mock, "~> 0.3.0", only: :test},
      {:mox, "~> 1.0", only: :test},
      {:open_api_spex, "~> 3.11"},
      {:phoenix, "~> 1.6.2"},
      {:phoenix_ecto, "~> 4.4"},
      {:phoenix_html, "~> 3.0"},
      {:phoenix_live_dashboard, "~> 0.6"},
      {:phoenix_live_reload, "~> 1.2", only: [:dev, :wanda]},
      {:phoenix_live_view, "~> 0.17.1"},
      {:phoenix_swoosh, "~> 1.0"},
      {:plug_cowboy, "~> 2.5"},
      {:postgrex, ">= 0.0.0"},
      {:pow, "~> 1.0.26"},
      {:quantum, ">= 1.8.0"},
      {:swoosh, "~> 1.3"},
      {:telemetry_metrics, "~> 0.6"},
      {:telemetry_poller, "~> 1.0"},
      {:timex, "~> 3.7.7"},
      {:trento_contracts, github: "trento-project/contracts", ref: "c43ae58", sparse: "elixir"},
      {:proper_case, "~> 1.3.1"},
      {:polymorphic_embed, "~> 2.0.0"}
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
      setup: ["deps.get", "event_store.setup", "ecto.setup", "init_grafana_dashboards"],
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
      "assets.deploy": [
        "cmd --cd assets npm run tailwind:build",
        "cmd --cd assets npm run build",
        "phx.digest"
      ]
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
