defmodule TrentoWeb.Plugs.AuthenticateAPIKeyPlugTest do
  use TrentoWeb.ConnCase, async: true
  use Plug.Test

  alias TrentoWeb.Auth.ApiKey
  alias TrentoWeb.Plugs.ApiAuthErrorHandler
  alias TrentoWeb.Plugs.AuthenticateAPIKeyPlug

  test "Reject an Unauthorized request" do
    conn = conn(:get, "/foo", "bar=10")

    conn = AuthenticateAPIKeyPlug.call(conn, ApiAuthErrorHandler)

    assert {401, _headers, response_body} = sent_resp(conn)
    assert %{"error" => "Unauthorized"} = Jason.decode!(response_body)
  end

  test "Accept an Authenticated request" do
    conn =
      conn(:get, "/foo")
      |> put_req_header("x-trento-apikey", ApiKey.get_api_key())
      |> AuthenticateAPIKeyPlug.call(ApiAuthErrorHandler)

    assert %{assigns: %{api_key_authenticated: true}} = conn
  end
end