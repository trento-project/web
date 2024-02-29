defmodule TrentoWeb.Plugs.AuthenticateAPIKeyPlugTest do
  use TrentoWeb.ConnCase, async: true
  use Plug.Test

  import Trento.Factory
  import Mox

  alias TrentoWeb.Auth.{AccessToken, ApiKey}
  alias TrentoWeb.Plugs.ApiAuthErrorHandler
  alias TrentoWeb.Plugs.AuthenticateAPIKeyPlug

  setup [:set_mox_from_context, :verify_on_exit!]

  @test_timestamp 1_671_641_814

  test "should reject an Unauthorized request" do
    expect(
      Joken.CurrentTime.Mock,
      :current_time,
      0,
      fn ->
        @test_timestamp
      end
    )

    conn = conn(:get, "/foo", "bar=10")

    conn = AuthenticateAPIKeyPlug.call(conn, ApiAuthErrorHandler)

    assert {401, _headers, response_body} = sent_resp(conn)
    assert %{"error" => "Unauthorized"} = Jason.decode!(response_body)
  end

  test "should accept an Authenticated request with the correct jti" do
    expect(
      Joken.CurrentTime.Mock,
      :current_time,
      2,
      fn ->
        @test_timestamp
      end
    )

    token_creation_date = DateTime.add(DateTime.from_unix!(@test_timestamp), -1, :hour)
    %{jti: jti} = insert(:api_key_settings, created_at: token_creation_date)

    api_key =
      ApiKey.generate_api_key!(
        %{
          "jti" => jti
        },
        token_creation_date,
        nil
      )

    conn =
      conn(:get, "/foo")
      |> put_req_header("x-trento-apikey", api_key)
      |> AuthenticateAPIKeyPlug.call(ApiAuthErrorHandler)

    assert %{assigns: %{api_key_authenticated: true}} = conn
  end

  test "should not accept an Authenticated request with the incorrect jti" do
    expect(
      Joken.CurrentTime.Mock,
      :current_time,
      2,
      fn ->
        @test_timestamp
      end
    )

    token_creation_date = DateTime.add(DateTime.from_unix!(@test_timestamp), -1, :hour)
    insert(:api_key_settings, created_at: token_creation_date)

    api_key =
      ApiKey.generate_api_key!(
        %{
          "jti" => UUID.uuid4()
        },
        token_creation_date,
        nil
      )

    conn =
      conn(:get, "/foo")
      |> put_req_header("x-trento-apikey", api_key)
      |> AuthenticateAPIKeyPlug.call(ApiAuthErrorHandler)

    assert {401, _headers, response_body} = sent_resp(conn)
    assert %{"error" => "Unauthorized"} = Jason.decode!(response_body)
  end

  test "should not accept a request with an invalid token" do
    expect(
      Joken.CurrentTime.Mock,
      :current_time,
      3,
      fn ->
        @test_timestamp
      end
    )

    token_creation_date = DateTime.add(DateTime.from_unix!(@test_timestamp), -1, :hour)
    insert(:api_key_settings, created_at: token_creation_date)
    # Let's create a user token

    api_key = AccessToken.generate_access_token!(%{})

    conn =
      conn(:get, "/foo")
      |> put_req_header("x-trento-apikey", api_key)
      |> AuthenticateAPIKeyPlug.call(ApiAuthErrorHandler)

    assert {401, _headers, response_body} = sent_resp(conn)
    assert %{"error" => "Unauthorized"} = Jason.decode!(response_body)
  end
end
