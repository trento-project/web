defmodule Trento.Operations.PolicyBehaviour do
  @moduledoc """
  Behaviour of the operations policies.
  """

  alias Trento.Clusters.Projections.ClusterReadModel

  alias Trento.Databases.Projections.{
    DatabaseInstanceReadModel,
    DatabaseReadModel
  }

  alias Trento.Hosts.Projections.HostReadModel

  alias Trento.SapSystems.Projections.{
    ApplicationInstanceReadModel,
    SapSystemReadModel
  }

  @callback authorize_operation(
              operation :: atom,
              read_model ::
                ApplicationInstanceReadModel.t()
                | ClusterReadModel.t()
                | DatabaseInstanceReadModel.t()
                | DatabaseReadModel.t()
                | HostReadModel.t()
                | SapSystemReadModel.t(),
              params :: map
            ) :: :ok | {:error, [String.t()]}
end
