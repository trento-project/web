defmodule Tronto.Monitoring.Domain.HanaClusterDetails do
  @moduledoc """
  Represents the details of a HANA cluster.
  """
  use TypedStruct
  use Domo

  defmodule Resource do
    @moduledoc """
    Represents the resource of a HANA cluster.
    """
    use TypedStruct
    use Domo

    @derive Jason.Encoder
    typedstruct do
      field :id, String.t(), enforce: true
      field :type, String.t(), enforce: true
      field :role, String.t(), enforce: true
      field :status, String.t() | nil
      field :fail_count, non_neg_integer() | nil
    end
  end

  defmodule Node do
    @moduledoc """
    Represents the node of a HANA cluster.
    """
    use TypedStruct
    use Domo

    @derive Jason.Encoder
    typedstruct do
      field :name, String.t(), enforce: true
      field :site, String.t(), enforce: true
      field :hana_status, String.t(), enforce: true
      field :resources, [Resource.t()] | nil, enforce: true
      field :attributes, %{String.t() => String.t()}, enforce: true
    end
  end

  defmodule SbdDevice do
    @moduledoc """
    Represents the SBDDevice of a HANA cluster.
    """

    use TypedStruct
    use Domo

    @derive Jason.Encoder
    typedstruct do
      field :device, String.t(), enforce: true
      field :status, String.t(), enforce: true
    end
  end

  @derive Jason.Encoder
  typedstruct do
    @typedoc "HanaClusterDetails value object"

    field :system_replication_mode, String.t(), enforce: true
    field :system_replication_operation_mode, String.t(), enforce: true
    field :secondary_sync_state, String.t() | nil, enforce: true
    field :sr_health_state, String.t(), enforce: true
    field :fencing_type, String.t(), enforce: true
    field :stopped_resources, [Resource.t()], enforce: true
    field :nodes, [Node.t()], enforce: true
    field :sbd_devices, [SbdDevice.t()], enforce: true
  end
end
