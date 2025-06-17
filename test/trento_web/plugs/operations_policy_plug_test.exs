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
    scenarios = [
      fn _conn -> nil end,
      fn _conn -> {:error, :not_found} end,
      fn _operation, _conn -> nil end,
      fn _operation, _conn -> {:error, :not_found} end
    ]

    for resource_fun <- scenarios do
      opts = [
        policy: TestPolicy,
        operation: fn _ -> :foo end,
        resource: resource_fun
      ]

      init_opts = OperationsPolicyPlug.init(opts)
      conn = OperationsPolicyPlug.call(conn, init_opts)

      assert %{
               "errors" => [
                 %{"detail" => "The requested resource cannot be found.", "title" => "Not Found"}
               ]
             } == json_response(conn, 404)
    end
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

  successful_resource_loading_scenarios = [
    %{
      name: "direct return of a resource",
      resource: %{foo: "bar"},
      expected_resource: %{foo: "bar"}
    },
    %{
      name: ":ok tuple with a resource",
      resource: {:ok, %{bar: "baz"}},
      expected_resource: %{bar: "baz"}
    }
  ]

  for %{name: name, resource: resource, expected_resource: expected_resource} <-
        successful_resource_loading_scenarios do
    @resource resource
    @expected_resource expected_resource

    test "should authorize operation. scenario: #{name}", %{conn: conn} do
      scenarios = [
        fn _conn -> @resource end,
        fn _operation, _conn -> @resource end
      ]

      for resource_fun <- scenarios do
        opts = [
          policy: TestPolicy,
          operation: fn _ -> :authorized end,
          resource: resource_fun
        ]

        init_opts = OperationsPolicyPlug.init(opts)

        assert %{assigns: %{authorized_resource: @expected_resource, operation: :authorized}} =
                 OperationsPolicyPlug.call(conn, init_opts)
      end
    end

    test "should authorize operation and assign to assigns_to. scenario: #{name}", %{conn: conn} do
      scenarios = [
        fn _conn -> @resource end,
        fn _operation, _conn -> @resource end
      ]

      for resource_fun <- scenarios do
        opts = [
          policy: TestPolicy,
          operation: fn _ -> :authorized end,
          resource: resource_fun,
          assigns_to: :my_resource
        ]

        init_opts = OperationsPolicyPlug.init(opts)

        assert %{assigns: %{my_resource: @expected_resource}} =
                 OperationsPolicyPlug.call(conn, init_opts)
      end
    end
  end

  test "should not support resource_fun with incorrect arity" do
    incorrect_resource_fun_scenarios = [
      fn -> @resource end,
      fn _, _, _ -> @resource end
    ]

    for resource_fun <- incorrect_resource_fun_scenarios do
      opts = [
        policy: TestPolicy,
        operation: fn _ -> :authorized end,
        resource: resource_fun
      ]

      assert_raise ArgumentError,
                   "#{inspect(OperationsPolicyPlug)} :resource function must have arity 1 or 2",
                   fn ->
                     OperationsPolicyPlug.init(opts)
                   end
    end
  end

  test "should raise a runtime error if resource_fun with incorrect arity", %{conn: conn} do
    incorrect_resource_fun_scenarios = [
      fn -> @resource end,
      fn _, _, _ -> @resource end
    ]

    for resource_fun <- incorrect_resource_fun_scenarios do
      opts = [
        policy: TestPolicy,
        operation: fn _ -> :authorized end,
        resource: fn _ -> :foo end
      ]

      initiated_opts =
        opts
        |> OperationsPolicyPlug.init()
        |> Map.put(:resource, resource_fun)

      assert_raise RuntimeError,
                   "#{inspect(OperationsPolicyPlug)} :resource function must have arity 1 or 2",
                   fn ->
                     OperationsPolicyPlug.call(conn, initiated_opts)
                   end
    end
  end
end
