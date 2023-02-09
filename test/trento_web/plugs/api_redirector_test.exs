defmodule TrentoWeb.Plugs.ApiRedirectorTest do
  use TrentoWeb.ConnCase, async: true
  use Plug.Test

  alias TrentoWeb.Plugs.ApiRedirector

  defmodule StubRouter do
    def __routes__ do
      [%{verb: :get, path: "/api/v1/test"}]
    end
  end

  describe "call/2" do
    test "should raise ArgumentError when :latest_version option is missing", %{conn: conn} do
      assert_raise ArgumentError, "expected :latest_version option", fn ->
        conn = %{conn | path_info: ["api", "hosts"]}

        ApiRedirector.call(conn, [])
      end
    end

    test "should raise ArgumentError when :router option is missing", %{conn: conn} do
      assert_raise ArgumentError, "expected :router option", fn ->
        conn = %{conn | path_info: ["api", "hosts"]}

        ApiRedirector.call(conn, latest_version: "v1")
      end
    end

    test "should return 404 with the error view when the path is not recognized by the router", %{
      conn: conn
    } do
      conn = %{conn | path_info: ["api", "hosts"]}

      result_conn = ApiRedirector.call(conn, latest_version: "v1", router: StubRouter)

      resp_body = json_response(result_conn, 404)

      assert resp_body == %{"error" => "not found"}
    end

    test "should redirect to the correct path when the route is recognized with the latest version",
         %{conn: conn} do
      conn = %{conn | path_info: ["api", "test"]}

      result_conn = ApiRedirector.call(conn, latest_version: "v1", router: StubRouter)

      assert result_conn.status == 302
      location_header = get_resp_header(result_conn, "location")

      assert location_header == ["/api/v1/test"]
    end
  end
end
