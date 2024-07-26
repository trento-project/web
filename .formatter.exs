[
  import_deps: [:ecto, :phoenix, :ecto_sql, :commanded, :open_api_spex],
  locals_without_parens: [
    # mock
    assert_called: :*,
    assert_not_called: :*
  ],
  inputs: ["*.{heex,ex,exs}", "priv/*/seeds.exs", "{config,lib,test}/**/*.{heex,ex,exs}"],
  subdirectories: ["priv/*/migrations"],
  plugins: [Phoenix.LiveView.HTMLFormatter]
]
