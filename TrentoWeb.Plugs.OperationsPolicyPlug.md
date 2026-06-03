# `TrentoWeb.Plugs.OperationsPolicyPlug`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento_web/plugs/operations_policy_plug.ex#L4)

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
     when action in HostOperations.values()

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

# `call`

# `get_params`

# `init`

---

*Consult [api-reference.md](api-reference.md) for complete listing*
