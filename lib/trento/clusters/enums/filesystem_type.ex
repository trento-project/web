defmodule Trento.Clusters.Enums.FilesystemType do
  @moduledoc """
  Type that represents the filesystem types used by an ASCS/ERS cluster.
  """

  use Trento.Support.Enum, values: [:resource_managed, :simple_mount, :mixed_fs_types]
end
