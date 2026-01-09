defmodule TrentoWeb.EndpointTest do
  use ExUnit.Case, async: true
  import Plug.Test
  import Plug.Conn

  test "set_script_name sets script_name from x-forwarded-prefix single segment" do
    conn =
      conn(:get, "/")
      |> put_req_header("x-forwarded-prefix", "/trento")
      |> TrentoWeb.Endpoint.set_script_name([])

    assert conn.script_name == ["trento"]
  end

  test "set_script_name sets script_name from x-forwarded-prefix nested segments" do
    conn =
      conn(:get, "/")
      |> put_req_header("x-forwarded-prefix", "/trento/sub")
      |> TrentoWeb.Endpoint.set_script_name([])

    assert conn.script_name == ["trento", "sub"]
  end

  test "set_script_name normalizes leading/trailing slashes" do
    conn =
      conn(:get, "/")
      |> put_req_header("x-forwarded-prefix", "/trento/")
      |> TrentoWeb.Endpoint.set_script_name([])

    assert conn.script_name == ["trento"]
  end

  test "set_script_name leaves conn unchanged when header is missing or empty" do
    conn1 = conn(:get, "/") |> TrentoWeb.Endpoint.set_script_name([])
    assert conn1.script_name == []

    conn2 =
      conn(:get, "/")
      |> put_req_header("x-forwarded-prefix", "")
      |> TrentoWeb.Endpoint.set_script_name([])

    assert conn2.script_name == []
  end
end
