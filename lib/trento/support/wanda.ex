# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Support.Wanda do
  @moduledoc """
  Helpers for interacting with the Wanda checks service.
  """

  def resolve_url(path, origin) do
    base_url = Application.fetch_env!(:trento, :checks_service)[:base_url] || ""

    case URI.parse(base_url) do
      %URI{scheme: scheme} when scheme in ["http", "https"] ->
        base_url <> path

      _ when is_binary(origin) and origin != "" ->
        origin <> base_url <> path

      _ ->
        base_url <> path
    end
  end
end
