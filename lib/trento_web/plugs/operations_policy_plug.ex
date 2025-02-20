defmodule TrentoWeb.Plugs.OperationsPolicyPlug do
  @moduledoc """
  This plug is responsible for authorizing operations. It falls back to `{:error, :forbidden}` if
  the resource is not authorized.

  Options:
  - policy: Operations policy implementing Trento.Operations.PolicyBehaviour
  - resource: Function returning the resource to be authorized. If it returns `nil` {:error, :not_found} is fallen back
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
    params = Keyword.get(opts, :params, &__MODULE__.get_params/1)
    assigns_to = Keyword.get(opts, :assigns_to, :authorized_resource)

    if is_nil(policy), do: raise(ArgumentError, "#{inspect(__MODULE__)} :policy option required")

    if is_nil(operation),
      do: raise(ArgumentError, "#{inspect(__MODULE__)} :operation option required")

    if is_nil(resource),
      do: raise(ArgumentError, "#{inspect(__MODULE__)} :resource option is required")

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
    params = params_fun.(conn)

    with {:ok, resource} <- handle_resource(conn, opts),
         {:ok, operation} <- handle_operation(conn, opts),
         :ok <- handle_permission(policy, operation, resource, params) do
      assign(conn, assigns_to, resource)
    else
      error ->
        conn
        |> TrentoWeb.FallbackController.call(error)
        |> Plug.Conn.halt()
    end
  end

  def get_params(_), do: %{}

  defp handle_resource(conn, %{resource: resource_fun}) do
    case resource_fun.(conn) do
      nil ->
        {:error, :not_found}

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
    if policy.authorize_operation(operation, resource, params) do
      :ok
    else
      {:error, :forbidden}
    end
  end
end
