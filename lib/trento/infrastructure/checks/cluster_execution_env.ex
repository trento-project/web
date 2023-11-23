defmodule Trento.Infrastructure.Checks.ClusterExecutionEnv do
  @moduledoc """
  Cluster checks execution env map
  """

  @required_fields :all
  use Trento.Support.Type

  require Trento.Enums.Provider, as: Provider
  require Trento.Enums.ClusterType, as: ClusterType

  deftype do
    field :cluster_type, Ecto.Enum, values: ClusterType.values()
    field :provider, Ecto.Enum, values: Provider.values()
  end
end
