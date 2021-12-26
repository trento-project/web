[
  import_deps: [:ecto, :phoenix, :typed_struct],
  locals_without_parens: [
    # mock
    assert_called: :*
  ],
  inputs: ["*.{ex,exs}", "priv/*/seeds.exs", "{config,lib,test}/**/*.{ex,exs}"],
  subdirectories: ["priv/*/migrations"]
]
