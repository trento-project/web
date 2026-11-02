# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule TrentoWeb.Plugs.InvalidCredentialsErrorPlug do
  @moduledoc """
  Renders the invalid credentials error of the fallback controller.

  Used as `render_error` of `OpenApiSpex.Plug.CastAndValidate` where a request failing the validation is a failed authentication
  """
  @behaviour Plug

  alias TrentoWeb.FallbackController

  @impl true
  def init(errors), do: errors

  @impl true
  def call(conn, _errors), do: FallbackController.call(conn, {:error, :invalid_credentials})
end
