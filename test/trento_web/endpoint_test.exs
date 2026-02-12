defmodule TrentoWeb.EndpointTest do
  use ExUnit.Case, async: true
  import Plug.Test
  import Plug.Conn

  test "set_script_name sets script_name from x-forwarded-prefix single segment" do
    conn =
      TrentoWeb.Endpoint.set_script_name(
        put_req_header(conn(:get, "/"), "x-forwarded-prefix", "/trento"),
        []
      )

    assert conn.script_name == ["trento"]
  end

  test "set_script_name sets script_name from x-forwarded-prefix nested segments" do
    conn =
      TrentoWeb.Endpoint.set_script_name(
        put_req_header(conn(:get, "/"), "x-forwarded-prefix", "/trento/sub"),
        []
      )

    assert conn.script_name == ["trento", "sub"]
  end

  test "set_script_name normalizes leading/trailing slashes" do
    conn =
      TrentoWeb.Endpoint.set_script_name(
        put_req_header(conn(:get, "/"), "x-forwarded-prefix", "/trento/"),
        []
      )

    assert conn.script_name == ["trento"]
  end

  test "set_script_name leaves conn unchanged when header is missing or empty" do
    conn1 = TrentoWeb.Endpoint.set_script_name(conn(:get, "/"), [])
    assert conn1.script_name == []

    conn2 =
      TrentoWeb.Endpoint.set_script_name(
        put_req_header(conn(:get, "/"), "x-forwarded-prefix", ""),
        []
      )

    assert conn2.script_name == []
  end
end
