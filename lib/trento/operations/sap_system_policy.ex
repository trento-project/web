defmodule Trento.Operations.SapSystemPolicy do
  @moduledoc """
  SapSystemReadModel operation policies
  """

  @behaviour Trento.Operations.PolicyBehaviour

  def authorize_operation(
        operation,
        _,
        _
      )
      when operation in [:sap_system_start, :sap_system_stop] do
    :ok
  end

  def authorize_operation(_, _, _), do: {:error, ["Unknown operation"]}
end
