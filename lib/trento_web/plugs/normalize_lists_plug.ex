# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule TrentoWeb.Plugs.NormalizeListsPlug do
  @moduledoc """
  This plug normalizes query string elements into lists when they are not formmated
  in brackets format.
  This is needed to be compatible with openAPI 3.0, as brackets format is not supported.
  The plug must be used before `plug OpenApiSpex.Plug.CastAndValidate` to make effect.

  Options:
  - list_fields: Query fields to convert into a list for each action

  Usage example:
  plug TrentoWeb.Plugs.NormalizeListsPlug,
    list_fields: %{
      get_activity_log: ["severity", "actor", "type"]
    }
  """
  @behaviour Plug

  @impl true
  def init(opts), do: Map.new(opts)

  @impl true
  @spec call(Plug.Conn.t(), any) :: Plug.Conn.t()
  def call(%{query_string: ""} = conn, _opts), do: conn

  def call(%{params: params, query_string: query_string} = conn, opts) do
    action = Phoenix.Controller.action_name(conn)
    list_fields = get_in(opts, [:list_fields, action]) || []

    # get query field/values from raw query string and make a list if
    # the field is in the whitelist
    normalized_params =
      query_string
      |> String.split("&", trim: true)
      |> Enum.reduce(%{}, fn pair, acc ->
        {query_field, query_value} =
          case String.split(pair, "=", parts: 2) do
            [key, value] -> {URI.decode_www_form(key), URI.decode_www_form(value)}
            [key] -> {URI.decode_www_form(key), ""}
          end

        is_bracket_array = String.contains?(query_field, "[]")
        query_field = String.replace(query_field, "[]", "")
        is_force_list = query_field in list_fields || is_bracket_array

        Map.update(acc, query_field, wrap_if(query_value, is_force_list), fn existing ->
          List.wrap(existing) ++ [query_value]
        end)
      end)

    %{conn | params: Map.merge(params, normalized_params), query_params: normalized_params}
  end

  defp wrap_if(v, true), do: [v]
  defp wrap_if(v, false), do: v
end
