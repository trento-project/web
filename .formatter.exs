# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

[
  import_deps: [:ecto, :phoenix, :ecto_sql, :commanded, :open_api_spex],
  locals_without_parens: [
    # mock
    assert_called: :*,
    assert_not_called: :*,
    # Trento.AI.ControllerSpecs
    ai_tool: 1,
    ai_tool: 2
  ],
  inputs: ["*.{heex,ex,exs}", "priv/*/seeds.exs", "{config,lib,test}/**/*.{heex,ex,exs}"],
  subdirectories: ["priv/*/migrations"],
  plugins: [Phoenix.LiveView.HTMLFormatter]
]
