defmodule Trento.Operations.SapSystemPolicy do
  @moduledoc """
  SapSystemReadModel operation policies
  """

  @behaviour Trento.Operations.PolicyBehaviour

  alias Trento.SapSystems.Projections.ApplicationInstanceReadModel

  def authorize_operation(operation, %ApplicationInstanceReadModel{}, _)
      when operation in [:sap_instance_start, :sap_instance_stop] do
    :ok
  end

  def authorize_operation(_, _, _), do: {:error, ["Unknown operation"]}
end
