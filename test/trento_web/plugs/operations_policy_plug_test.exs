defmodule TrentoWeb.Plugs.OperationsPolicyPlugTest do
  use TrentoWeb.ConnCase, async: true
  use Plug.Test

  alias TrentoWeb.Plugs.OperationsPolicyPlug

  defmodule TestPolicy do
    @behaviour Trento.Operations.PolicyBehaviour

    def authorize_operation(:authorized, _, _), do: true
    def authorize_operation(:forbidden, _, _), do: false
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
    opts = [
      policy: TestPolicy,
      operation: fn _ -> :forbidden end,
      resource: fn _ -> %{} end
    ]

    init_opts = OperationsPolicyPlug.init(opts)
    conn = OperationsPolicyPlug.call(conn, init_opts)

    assert %{
             "errors" => [
               %{
                 "detail" => "You can't perform the operation or access the resource.",
                 "title" => "Forbidden"
               }
             ]
           } == json_response(conn, 403)
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
