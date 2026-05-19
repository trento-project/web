# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule TrentoWeb.Plugs.NormalizeListsPlugTest do
  use TrentoWeb.ConnCase, async: true

  alias TrentoWeb.Plugs.NormalizeListsPlug

  test "should convert whitelisted fields to list", %{conn: conn} do
    opts = %{
      list_fields: %{
        my_action: ["to_list", "to_list_single"]
      }
    }

    conn =
      conn
      |> put_private(:phoenix_action, :my_action)
      |> Map.put(
        :query_string,
        "to_list=1&to_list=2&other=3&to_list_single=4&bracket_list[]=5&repeated=6&repeated=7"
      )
      |> NormalizeListsPlug.call(opts)

    assert %{
             query_params: %{
               "to_list" => ["1", "2"],
               "other" => "3",
               "to_list_single" => ["4"],
               "bracket_list" => ["5"],
               "repeated" => ["6", "7"]
             }
           } = conn
  end

  test "should not convert if the action does not match", %{conn: conn} do
    opts = %{
      list_fields: %{
        my_action: ["to_list"]
      }
    }

    conn =
      conn
      |> put_private(:phoenix_action, :other_action)
      |> Map.put(:query_string, "to_list=1")
      |> NormalizeListsPlug.call(opts)

    assert %{
             query_params: %{"to_list" => "1"}
           } = conn
  end
end
