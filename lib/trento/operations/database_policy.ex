defmodule Trento.Operations.DatabasePolicy do
  @moduledoc """
  DatabaseReadModel operation policies
  """

  @behaviour Trento.Operations.PolicyBehaviour

  require Trento.Operations.Enums.DatabaseOperations, as: DatabaseOperations

  def authorize_operation(
        operation,
        _,
        _
      )
      when operation in DatabaseOperations.values() do
    :ok
  end

  def authorize_operation(_, _, _), do: {:error, ["Unknown operation"]}
end
