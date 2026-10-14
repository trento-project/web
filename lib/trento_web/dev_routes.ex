# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule TrentoWeb.DevRoutes do
  @moduledoc """
  Routes of dev only dependencies.

  Both branches of an `if` in the router are expanded at compile time, so the
  router cannot reference a macro of a dependency that is missing in test and
  prod. These macros emit the routes only when the dependency is compiled in.
  """

  @doc """
  Mounts the Oban Web dashboard at `path`, when `oban_web` is available.
  """
  defmacro oban_dashboard(path) do
    if Code.ensure_loaded?(Oban.Web.Router) do
      quote do
        require Oban.Web.Router
        Oban.Web.Router.oban_dashboard(unquote(path))
      end
    end
  end
end
