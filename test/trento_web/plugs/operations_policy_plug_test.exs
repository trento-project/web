defmodule TrentoWeb.Plugs.OperationsPolicyPlugTest do
  use TrentoWeb.ConnCase, async: true
  use Plug.Test

  import OpenApiSpex.TestAssertions

  alias TrentoWeb.OpenApi.V1.ApiSpec
  alias TrentoWeb.Plugs.OperationsPolicyPlug

  defmodule TestPolicy do
    @behaviour Trento.Operations.PolicyBehaviour

    def authorize_operation(:authorized, _, _), do: :ok
    def authorize_operation(:forbidden, _, _), do: {:error, ["error1", "error2"]}
  end

  setup %{conn: conn} do
    {:ok, conn: Phoenix.Controller.accepts(conn, ["json"])}
  end

  test "should return not found if the given resource is not found", %{conn: conn} do
    opts = [
      policy: TestPolicy,
      operation: fn _ -> nil end,
      resource: fn _ -> nil end
    ]

    init_opts = OperationsPolicyPlug.init(opts)
    conn = OperationsPolicyPlug.call(conn, init_opts)

    assert %{
             "errors" => [
               %{"detail" => "The requested resource cannot be found.", "title" => "Not Found"}
             ]
           } == json_response(conn, 404)
  end

  test "should return operation not found if the given operation is not found", %{conn: conn} do
    opts = [
      policy: TestPolicy,
      operation: fn _ -> nil end,
      resource: fn _ -> %{} end
    ]

    init_opts = OperationsPolicyPlug.init(opts)
    conn = OperationsPolicyPlug.call(conn, init_opts)

    assert %{
             "errors" => [
               %{"detail" => "Operation not found.", "title" => "Not Found"}
             ]
           } == json_response(conn, 404)
  end

  test "should forbid operation if the resourcec is not authorized", %{conn: conn} do
    api_spec = ApiSpec.spec()

    opts = [
      policy: TestPolicy,
      operation: fn _ -> :forbidden end,
      resource: fn _ -> %{} end
    ]

    init_opts = OperationsPolicyPlug.init(opts)
    conn = OperationsPolicyPlug.call(conn, init_opts)

    resp = json_response(conn, 403)

    assert %{
             "errors" => [
               %{
                 "detail" => "error1",
                 "title" => "Forbidden"
               },
               %{
                 "detail" => "error2",
                 "title" => "Forbidden"
               }
             ]
           } == resp

    assert_schema(resp, "Forbidden", api_spec)
  end

  test "should authorize operation", %{conn: conn} do
    resource = %{key: "value"}

    opts = [
      policy: TestPolicy,
      operation: fn _ -> :authorized end,
      resource: fn _ -> resource end
    ]

    init_opts = OperationsPolicyPlug.init(opts)

    assert %{assigns: %{authorized_resource: ^resource}} =
             OperationsPolicyPlug.call(conn, init_opts)
  end

  test "should authorize operation and assign to assigns_to", %{conn: conn} do
    resource = %{key: "value"}

    opts = [
      policy: TestPolicy,
      operation: fn _ -> :authorized end,
      resource: fn _ -> resource end,
      assigns_to: :my_resource
    ]

    init_opts = OperationsPolicyPlug.init(opts)
    assert %{assigns: %{my_resource: ^resource}} = OperationsPolicyPlug.call(conn, init_opts)
  end
end
