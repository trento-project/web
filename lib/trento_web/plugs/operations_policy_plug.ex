defmodule TrentoWeb.Plugs.OperationsPolicyPlug do
  @moduledoc """
  This plug is responsible for authorizing operations. It falls back to `{:error, :forbidden}` if
  the resource is not authorized.

  Options:
  - policy: Operations policy implementing Trento.Operations.PolicyBehaviour
  - resource: Function returning the resource to be authorized.
    It can return:
    - `nil` {:error, :not_found} is fallen back
    - {:error, _} in which case the error is returned as is.
    - {:ok, resource} in which case the resource is used for authorization.
    - a non null return value, in which case it is used as the resource for authorization.
    It can be a function with arity 1 or 2:
    - arity 1: `resource_fun.(conn)` where `conn` is the Plug.Conn
    - arity 2: `resource_fun.(operation, conn)` where `operation` is the resolved operation to authorize and `conn` is the current Plug.Conn.
  - operation: Function returning the operation to authorize. If it returns `nil` {:error, :operation_not_found} is fallen back
  - params: Function returning the operation params. It returns an empty map by default.
  - assigns_to: Atom defining where the authorized resource is assigned in the conn once the plug finishes successfully.
    It is available at `%{assigns: %{authorized_resource: resource}}`. `authorized_resource` by default

  The plug can be used like:
  ```
  plug TrentoWeb.Plugs.OperationsPolicyPlug,
       [
         policy: Trento.Operations.MyPolicy,
         resource: &__MODULE__.get_resource/1,
         operation: &__MODULE__.get_operation/1,
         params: &__MODULE__.get_params/1
         assigns_to: :resource
       ]
       when action == :request_operation

  def get_resource(conn) do
    # return the resource to be authorized
  end

  def get_operation(conn) do
    # return the operation to authorize
  end

  def get_params(conn) do
    # return the parameters
  end
  ```
  """

  import Plug.Conn

  @spec init() :: %{
          policy: module(),
          operation: fun(),
          resource: fun(),
          params: fun(),
          assigns_to: atom()
        }
  def init(opts \\ []) do
    policy = Keyword.get(opts, :policy)
    operation = Keyword.get(opts, :operation)
    resource = Keyword.get(opts, :resource)
    params = Keyword.get(opts, :params, &__MODULE__.get_params/2)
    assigns_to = Keyword.get(opts, :assigns_to, :authorized_resource)

    if is_nil(policy), do: raise(ArgumentError, "#{inspect(__MODULE__)} :policy option required")

    if is_nil(operation),
      do: raise(ArgumentError, "#{inspect(__MODULE__)} :operation option required")

    if is_nil(resource),
      do: raise(ArgumentError, "#{inspect(__MODULE__)} :resource option is required")

    if not valid_resource_func?(resource),
      do: raise(ArgumentError, "#{inspect(__MODULE__)} :resource function must have arity 1 or 2")

    %{
      policy: policy,
      operation: operation,
      resource: resource,
      params: params,
      assigns_to: assigns_to
    }
  end

  def call(
        conn,
        %{
          policy: policy,
          params: params_fun,
          assigns_to: assigns_to
        } = opts
      ) do
    with {:ok, operation} <- handle_operation(conn, opts),
         {:ok, resource} <- handle_resource(operation, conn, opts),
         params <- params_fun.(operation, conn),
         :ok <- handle_permission(policy, operation, resource, params) do
      conn
      |> assign(assigns_to, resource)
      |> assign(:operation, operation)
    else
      error ->
        conn
        |> TrentoWeb.FallbackController.call(error)
        |> Plug.Conn.halt()
    end
  end

  def get_params(_operation, _), do: %{}

  defp handle_resource(operation, conn, %{resource: resource_fun}) do
    case invoke_resource_fun(operation, resource_fun, conn) do
      nil ->
        {:error, :not_found}

      {:error, _} = error ->
        error

      {:ok, _found_resource} = success ->
        success

      found_resource ->
        {:ok, found_resource}
    end
  end

  defp handle_operation(conn, %{operation: operation_fun}) do
    case operation_fun.(conn) do
      nil ->
        {:error, :operation_not_found}

      found_operation ->
        {:ok, found_operation}
    end
  end

  defp handle_permission(policy, operation, resource, params) do
    case policy.authorize_operation(operation, resource, params) do
      :ok -> :ok
      {:error, errors} -> {:error, :forbidden, errors}
    end
  end

  defp valid_resource_func?(resource_fun) do
    case get_func_arity(resource_fun) do
      1 -> true
      2 -> true
      _ -> false
    end
  end

  defp invoke_resource_fun(operation, resource_fun, conn) do
    case get_func_arity(resource_fun) do
      1 -> resource_fun.(conn)
      2 -> resource_fun.(operation, conn)
      _ -> raise RuntimeError, "#{inspect(__MODULE__)} :resource function must have arity 1 or 2"
    end
  end

  defp get_func_arity(func) do
    case Function.info(func, :arity) do
      {:arity, arity} -> arity
    end
  end
end
