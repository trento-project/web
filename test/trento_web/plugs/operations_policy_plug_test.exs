# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule TrentoWeb.Plugs.OperationsPolicyPlugTest do
  use TrentoWeb.ConnCase, async: true

  import OpenApiSpex.TestAssertions

  alias TrentoWeb.OpenApi.V1.ApiSpec
  alias TrentoWeb.Plugs.OperationsPolicyPlug

  defmodule TestPolicy do
    @behaviour Trento.Operations.PolicyBehaviour

    def authorize_operation(:authorized, _, _), do: :ok

    def authorize_operation(:forbidden, _, _),
      do:
        {:error,
         [
           %{message: "error1", metadata: [%{"key" => "value"}]},
           %{message: "error2", metadata: []}
         ]}

    def authorize_operation(_, %{authorization: authorization}, _), do: authorization

    def metadata(%{id: id}), do: %{id: id, label: "resource#{id}", type: :host}
  end

  setup %{conn: conn} do
    {:ok, conn: Phoenix.Controller.accepts(conn, ["json"])}
  end

  test "should return not found if the given resource is not found", %{conn: conn} do
    opts = [
      policy: TestPolicy,
      operation: fn _ -> :foo end,
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

  test "should return not found with the given reason if the resource function returns an error",
       %{conn: conn} do
    opts = [
      policy: TestPolicy,
      operation: fn _ -> :foo end,
      resource: fn _ -> {:error, "Host not found"} end
    ]

    init_opts = OperationsPolicyPlug.init(opts)
    conn = OperationsPolicyPlug.call(conn, init_opts)

    assert %{
             "errors" => [
               %{"detail" => "Host not found", "title" => "Not Found"}
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

  test "should forbid operation if the resource is not authorized", %{conn: conn} do
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
                 "title" => "Forbidden",
                 "metadata" => [%{"key" => "value"}]
               },
               %{
                 "detail" => "error2",
                 "title" => "Forbidden",
                 "metadata" => []
               }
             ]
           } == resp

    assert_schema(resp, "ForbiddenV1", api_spec)
  end

  test "should authorize operation", %{conn: conn} do
    resource = %{key: "value"}

    opts = [
      policy: TestPolicy,
      operation: fn _ -> :authorized end,
      resource: fn _ -> resource end
    ]

    init_opts = OperationsPolicyPlug.init(opts)

    assert %{assigns: %{authorized_resource: ^resource, operation: :authorized}} =
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

  test "should authorize operation over a list of resources", %{conn: conn} do
    resources = [%{id: 1}, %{id: 2}]

    opts = [
      policy: TestPolicy,
      operation: fn _ -> :authorized end,
      resource: fn _ -> resources end
    ]

    init_opts = OperationsPolicyPlug.init(opts)

    assert %{assigns: %{authorized_resource: ^resources, operation: :authorized}} =
             OperationsPolicyPlug.call(conn, init_opts)
  end

  test "should forbid operation over a list of resources and add the resource metadata to the errors",
       %{conn: conn} do
    api_spec = ApiSpec.spec()

    error1 = {:error, [%{message: "error1", metadata: [%{"key" => "value"}]}]}
    error2 = {:error, [%{message: "error2", metadata: []}]}

    opts = [
      policy: TestPolicy,
      operation: fn _ -> :foo end,
      resource: fn _ ->
        [
          %{id: 1, authorization: :ok},
          %{id: 2, authorization: error1},
          %{id: 3, authorization: error1},
          %{id: 4, authorization: error2}
        ]
      end
    ]

    init_opts = OperationsPolicyPlug.init(opts)
    conn = OperationsPolicyPlug.call(conn, init_opts)

    resp = json_response(conn, 403)

    assert %{
             "errors" => [
               %{
                 "detail" => "error1",
                 "title" => "Forbidden",
                 "metadata" => [
                   %{"key" => "value"},
                   %{
                     "id" => 2,
                     "label" => "resource2",
                     "type" => "host",
                     "bulk_operation" => true
                   }
                 ]
               },
               %{
                 "detail" => "error1",
                 "title" => "Forbidden",
                 "metadata" => [
                   %{"key" => "value"},
                   %{
                     "id" => 3,
                     "label" => "resource3",
                     "type" => "host",
                     "bulk_operation" => true
                   }
                 ]
               },
               %{
                 "detail" => "error2",
                 "title" => "Forbidden",
                 "metadata" => [
                   %{
                     "id" => 4,
                     "label" => "resource4",
                     "type" => "host",
                     "bulk_operation" => true
                   }
                 ]
               }
             ]
           } == resp

    assert_schema(resp, "ForbiddenV1", api_spec)
  end
end
