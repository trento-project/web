defmodule TrentoWeb.Plugs.ApiRedirectorTest do
  use TrentoWeb.ConnCase, async: true
  use Plug.Test

  alias TrentoWeb.Plugs.ApiRedirector

  defmodule FoundRouter do
    def __match_route__(_, _, _) do
      {%{}, %{}, %{}, {%{}, %{}}}
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
      defmodule ErrorNotFoundRouter do
        def __match_route__(_, _, _) do
          :error
        end
      end

      conn = %{conn | path_info: ["api", "hosts"]}

      result_conn = ApiRedirector.call(conn, latest_version: "v1", router: ErrorNotFoundRouter)

      resp_body = json_response(result_conn, 404)

      assert resp_body == %{"error" => "not found"}
    end

    test "should return 404 with the error view when the path is not recognized by the router because match the ApiRedirectorPlug",
         %{
           conn: conn
         } do
      defmodule NotFoundRouter do
        def __match_route__(_, _, _) do
          {%{plug: ApiRedirector}, %{}, %{}, {%{}, %{}}}
        end
      end

      conn = %{conn | path_info: ["api", "hosts"]}

      result_conn = ApiRedirector.call(conn, latest_version: "v1", router: NotFoundRouter)

      resp_body = json_response(result_conn, 404)

      assert resp_body == %{"error" => "not found"}
    end

    test "should redirect to the correct path when the route is recognized with the latest version",
         %{conn: conn} do
      conn = %{conn | path_info: ["api", "test"]}

      result_conn = ApiRedirector.call(conn, latest_version: "v1", router: FoundRouter)

      assert result_conn.status == 307
      location_header = get_resp_header(result_conn, "location")

      assert location_header == ["/api/v1/test"]
    end

    test "should redirect to the correct path with a subroute path when the route is recognized with the latest version",
         %{conn: conn} do
      conn = %{conn | path_info: ["api", "some-resource", "12345"]}

      result_conn = ApiRedirector.call(conn, latest_version: "v1", router: FoundRouter)

      assert result_conn.status == 307
      location_header = get_resp_header(result_conn, "location")

      assert location_header == ["/api/v1/some-resource/12345"]
    end
  end
end
