defmodule TrentoWeb.V1.ChecksExecutionSettingsControllerTest do
  use TrentoWeb.ConnCase, async: false

  import OpenApiSpex.TestAssertions
  import Trento.Factory
  import Trento.Support.Helpers.AbilitiesTestHelper

  setup_all :setup_api_spec_v1
  setup :setup_user

  setup do
    previous = Application.get_env(:trento, :checks_execution)
    on_exit(fn -> Application.put_env(:trento, :checks_execution, previous) end)
    Application.put_env(:trento, :checks_execution, interval: nil)
  end

  test "should return the checks execution settings", %{conn: conn, api_spec: api_spec} do
    conn
    |> get("/api/v1/settings/checks_execution")
    |> json_response(200)
    |> assert_schema("ChecksExecutionSettingsV1", api_spec)
    |> then(&assert(&1 == %{interval: "5m", enforced_from_env: false}))
  end

  test "should change the checks execution interval", %{conn: conn, api_spec: api_spec} do
    conn
    |> put_req_header("content-type", "application/json")
    |> put("/api/v1/settings/checks_execution", %{interval: "12h"})
    |> json_response(200)
    |> assert_schema("ChecksExecutionSettingsV1", api_spec)
    |> then(&assert(&1 == %{interval: "12h", enforced_from_env: false}))
  end

  test "should refuse an interval that is not allowed", %{conn: conn, api_spec: api_spec} do
    conn
    |> put_req_header("content-type", "application/json")
    |> put("/api/v1/settings/checks_execution", %{interval: "7m"})
    |> json_response(422)
    |> assert_schema("UnprocessableEntityV1", api_spec)
  end

  test "should refuse a change when the interval is enforced from the environment", %{
    conn: conn
  } do
    Application.put_env(:trento, :checks_execution, interval: "1h")

    assert %{"interval" => "1h", "enforced_from_env" => true} =
             conn
             |> get("/api/v1/settings/checks_execution")
             |> json_response(200)

    conn
    |> put_req_header("content-type", "application/json")
    |> put("/api/v1/settings/checks_execution", %{interval: "12h"})
    |> json_response(409)
  end

  test "should refuse a change from a user without the ability", %{
    conn: conn,
    api_spec: api_spec
  } do
    %{id: user_id} = insert(:user)

    conn
    |> Pow.Plug.assign_current_user(%{"user_id" => user_id}, Pow.Plug.fetch_config(conn))
    |> put_req_header("content-type", "application/json")
    |> put("/api/v1/settings/checks_execution", %{interval: "12h"})
    |> json_response(:forbidden)
    |> assert_schema("ForbiddenV1", api_spec)
  end
end
