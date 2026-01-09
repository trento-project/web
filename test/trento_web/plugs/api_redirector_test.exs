defmodule TrentoWeb.Plugs.ApiRedirectorTest do
  use TrentoWeb.ConnCase, async: true

  alias TrentoWeb.Plugs.ApiRedirector

  defmodule FoundRouter do
    def __match_route__(_, _, _) do
      {%{}, %{}, %{}, {%{}, %{}}}
    end
  end

  describe "init/1" do
    test "should raise ArgumentError when :available_api_versions option is missing" do
      assert_raise ArgumentError, "expected :available_api_versions option", fn ->
        ApiRedirector.init([])
      end
    end

    test "should raise ArgumentError when :available_api_versions is an empty list" do
      assert_raise ArgumentError, ":available_api_versions must have 1 element at least", fn ->
        ApiRedirector.init(available_api_versions: [])
      end
    end

    test "should raise ArgumentError when :router option is missing" do
      assert_raise ArgumentError, "expected :router option", fn ->
        ApiRedirector.init(available_api_versions: ["v2", "v1"])
      end
    end
  end

  describe "call/2" do
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

    test "should redirect to the newest version path when this version is available",
         %{conn: conn} do
      conn =
        conn
        |> Map.put(:path_info, ["api", "test"])
        |> ApiRedirector.call(available_api_versions: ["v2", "v1"], router: FoundRouter)

      assert 307 == conn.status

      location_header = get_resp_header(conn, "location")

      assert ["/api/v2/test"] == location_header
    end

    test "should redirect to the correctly versioned path with also a query string",
         %{conn: conn} do
      conn =
        conn
        |> Map.put(:path_info, ["api", "test"])
        |> Map.put(:query_string, "foo=bar&bar=baz&qux=42&baz=true")
        |> ApiRedirector.call(available_api_versions: ["v2", "v1"], router: FoundRouter)

      assert 307 == conn.status

      location_header = get_resp_header(conn, "location")

      assert ["/api/v2/test?foo=bar&bar=baz&qux=42&baz=true"] == location_header
    end

    test "should redirect to the next available version path if the newest version is not available",
         %{conn: conn} do
      defmodule V1FoundRouter do
        def __match_route__(["api", "v1", "test"], _, _) do
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

    test "should redirect correctly when app is served under a subpath", %{conn: conn} do
      conn =
        conn
        |> Map.put(:path_info, ["trento", "api", "test"])
        |> Map.put(:script_name, ["trento"])
        |> ApiRedirector.call(available_api_versions: ["v2", "v1"], router: FoundRouter)

      assert 307 == conn.status
      location_header = get_resp_header(conn, "location")
      assert ["/trento/api/v2/test"] == location_header
    end

    test "should redirect to the correctly versioned path with a query string when served under a subpath",
         %{conn: conn} do
      conn =
        conn
        |> Map.put(:path_info, ["trento", "api", "test"])
        |> Map.put(:query_string, "foo=bar&bar=baz")
        |> Map.put(:script_name, ["trento"])
        |> ApiRedirector.call(available_api_versions: ["v2", "v1"], router: FoundRouter)

      assert 307 == conn.status
      location_header = get_resp_header(conn, "location")
      assert ["/trento/api/v2/test?foo=bar&bar=baz"] == location_header
    end

    test "should ignore script_name if path_info does not start with it", %{conn: conn} do
      conn =
        conn
        |> Map.put(:path_info, ["api", "test"])
        |> Map.put(:script_name, ["trento"])
        |> ApiRedirector.call(available_api_versions: ["v2", "v1"], router: FoundRouter)

      assert 307 == conn.status
      location_header = get_resp_header(conn, "location")
      assert ["/api/v2/test"] == location_header
    end

    test "should redirect correctly when app is served under a nested subpath", %{conn: conn} do
      conn =
        conn
        |> Map.put(:path_info, ["trento", "sub", "api", "test"])
        |> Map.put(:script_name, ["trento", "sub"])
        |> ApiRedirector.call(available_api_versions: ["v2", "v1"], router: FoundRouter)

      assert 307 == conn.status
      location_header = get_resp_header(conn, "location")
      assert ["/trento/sub/api/v2/test"] == location_header
    end

    test "should redirect to the next available version under a subpath if the newest version is not available",
         %{conn: conn} do
      defmodule SubV1FoundRouter do
        def __match_route__(["api", "v1", "test"], _, _) do
          {%{}, %{}, %{}, {%{}, %{}}}
        end

        def __match_route__(_, _, _) do
          :error
        end
      end

      conn =
        conn
        |> Map.put(:path_info, ["trento", "api", "test"])
        |> Map.put(:script_name, ["trento"])
        |> ApiRedirector.call(available_api_versions: ["v2", "v1"], router: SubV1FoundRouter)

      assert 307 == conn.status
      location_header = get_resp_header(conn, "location")
      assert ["/trento/api/v1/test"] == location_header
    end

    test "should preserve repeated query params in the Location header when served under a subpath",
         %{conn: conn} do
      conn =
        conn
        |> Map.put(:path_info, ["trento", "api", "test"])
        |> Map.put(:script_name, ["trento"])
        |> Map.put(:query_string, "a=1&a=2")
        |> ApiRedirector.call(available_api_versions: ["v2", "v1"], router: FoundRouter)

      assert 307 == conn.status
      assert ["/trento/api/v2/test?a=1&a=2"] == get_resp_header(conn, "location")
    end

    test "should handle deeply nested resource paths under a subpath", %{conn: conn} do
      conn =
        conn
        |> Map.put(:path_info, ["trento", "api", "some", "deep", "path"])
        |> Map.put(:script_name, ["trento"])
        |> ApiRedirector.call(available_api_versions: ["v2", "v1"], router: FoundRouter)

      assert 307 == conn.status
      assert ["/trento/api/v2/some/deep/path"] == get_resp_header(conn, "location")
    end

    test "should respect HTTP method when resolving a versioned route under a subpath", %{
      conn: conn
    } do
      defmodule MethodPostRouter do
        def __match_route__(["api", "v2", "test"], "POST", _) do
          {%{}, %{}, %{}, {%{}, %{}}}
        end

        def __match_route__(_, _, _) do
          :error
        end
      end

      # POST should match
      post_conn =
        conn
        |> Map.put(:path_info, ["trento", "api", "test"])
        |> Map.put(:script_name, ["trento"])
        |> Map.put(:method, "POST")
        |> ApiRedirector.call(available_api_versions: ["v2", "v1"], router: MethodPostRouter)

      assert 307 == post_conn.status
      assert ["/trento/api/v2/test"] == get_resp_header(post_conn, "location")

      # GET should not match
      resp =
        conn
        |> Map.put(:path_info, ["trento", "api", "test"])
        |> Map.put(:script_name, ["trento"])
        |> Map.put(:method, "GET")
        |> ApiRedirector.call(available_api_versions: ["v2", "v1"], router: MethodPostRouter)
        |> json_response(404)

      assert %{
               "errors" => [
                 %{"title" => "Not Found", "detail" => "The requested resource cannot be found."}
               ]
             } == resp
    end
  end
end
