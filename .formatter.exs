[
  import_deps: [:ecto, :phoenix, :commanded, :typed_struct, :vex],
  locals_without_parens: [
    # mock
    assert_called: :*,
    assert_not_called: :*,
    # vex
    validates: :*
  ],
  inputs: ["*.{ex,exs}", "priv/*/seeds.exs", "{config,lib,test}/**/*.{ex,exs}"],
  subdirectories: ["priv/*/migrations"]
]
