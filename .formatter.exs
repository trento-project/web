[
  import_deps: [:ecto, :phoenix, :commanded, :open_api_spex],
  locals_without_parens: [
    # mock
    assert_called: :*,
    assert_not_called: :*
  ],
  inputs: ["*.{ex,exs}", "priv/*/seeds.exs", "{config,lib,test}/**/*.{ex,exs}"],
  subdirectories: ["priv/*/migrations"]
]
