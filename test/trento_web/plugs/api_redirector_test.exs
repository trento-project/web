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
    test "should raise ArgumentError when :available_api_versions option is missing", %{
      conn: conn
    } do
      assert_raise ArgumentError, "expected :available_api_versions option", fn ->
        conn = %{conn | path_info: ["api", "hosts"]}

        ApiRedirector.call(conn, [])
      end
    end

    test "should raise ArgumentError when :router option is missing", %{conn: conn} do
      assert_raise ArgumentError, "expected :router option", fn ->
        conn = %{conn | path_info: ["api", "hosts"]}

        ApiRedirector.call(conn, available_api_versions: ["v2", "v1"])
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

      resp =
        conn
        |> Map.put(:path_info, ["api", "hosts"])
        |> ApiRedirector.call(available_api_versions: ["v2", "v1"], router: ErrorNotFoundRouter)
        |> json_response(404)

      assert %{
               "errors" => [
                 %{"title" => "Not Found", "detail" => "The requested resource cannot be found."}
               ]
             } == resp
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

      resp =
        conn
        |> Map.put(:path_info, ["api", "hosts"])
        |> ApiRedirector.call(available_api_versions: ["v2", "v1"], router: NotFoundRouter)
        |> json_response(404)

      assert %{
               "errors" => [
                 %{"title" => "Not Found", "detail" => "The requested resource cannot be found."}
               ]
             } == resp
    end

    test "should redirect to the newest path when the route with the newest version is available",
         %{conn: conn} do
      conn =
        conn
        |> Map.put(:path_info, ["api", "test"])
        |> ApiRedirector.call(available_api_versions: ["v2", "v1"], router: FoundRouter)

      assert 307 == conn.status

      location_header = get_resp_header(conn, "location")

      assert ["/api/v2/test"] == location_header
    end

    test "should redirect to the next newest path when the route when it is the first available version",
         %{conn: conn} do
      defmodule V1FoundRouter do
        def __match_route__(_, ["api", "v1", "test"], _) do
          {%{}, %{}, %{}, {%{}, %{}}}
        end

        def __match_route__(_, _, _) do
          :error
        end
      end

      conn =
        conn
        |> Map.put(:path_info, ["api", "test"])
        |> ApiRedirector.call(available_api_versions: ["v2", "v1"], router: V1FoundRouter)

      assert 307 == conn.status

      location_header = get_resp_header(conn, "location")

      assert ["/api/v1/test"] == location_header
    end

    test "should redirect to the correct path with a subroute path when the route is recognized in the available versions list",
         %{conn: conn} do
      conn =
        conn
        |> Map.put(:path_info, ["api", "some-resource", "12345"])
        |> ApiRedirector.call(available_api_versions: ["v2", "v1"], router: FoundRouter)

      assert 307 == conn.status

      location_header = get_resp_header(conn, "location")

      assert ["/api/v2/some-resource/12345"] == location_header
    end
  end
end
