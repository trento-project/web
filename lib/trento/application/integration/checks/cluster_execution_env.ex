defmodule Trento.Integration.Checks.ClusterExecutionEnv do
  @moduledoc """
  Cluster checks execution env map
  """

  @required_fields :all
  use Trento.Type

  require Trento.Domain.Enums.Provider, as: Provider
  require Trento.Domain.Enums.ClusterType, as: ClusterType

  deftype do
    field :cluster_type, Ecto.Enum, values: ClusterType.values()
    field :provider, Ecto.Enum, values: Provider.values()
  end
end
