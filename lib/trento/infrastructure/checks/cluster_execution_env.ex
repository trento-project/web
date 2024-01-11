defmodule Trento.Infrastructure.Checks.ClusterExecutionEnv do
  @moduledoc """
  Cluster checks execution env map
  """

  @required_fields [:cluster_type, :provider]
  use Trento.Support.Type

  require Trento.Enums.Provider, as: Provider
  require Trento.Clusters.Enums.ClusterType, as: ClusterType
  require Trento.Clusters.Enums.FilesystemType, as: FilesystemType
  require Trento.SapSystems.Enums.EnsaVersion, as: EnsaVersion

  deftype do
    field :cluster_type, Ecto.Enum, values: ClusterType.values()
    field :provider, Ecto.Enum, values: Provider.values()
    field :filesystem_type, Ecto.Enum, values: FilesystemType.values()
    field :ensa_version, Ecto.Enum, values: EnsaVersion.values()
  end
end
