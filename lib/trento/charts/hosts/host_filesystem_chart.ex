defmodule Trento.Charts.Hosts.HostFilesystemChart do
  @moduledoc """
  Represents filesystem metrics for a host
  """

  alias Trento.Charts.SampledMetric

  @enforce_keys [
    :devices_size,
    :devices_avail,
    :filesystems_size,
    :filesystems_avail,
    :swap_total,
    :swap_avail
  ]
  defstruct [
    :devices_size,
    :devices_avail,
    :filesystems_size,
    :filesystems_avail,
    :swap_total,
    :swap_avail
  ]

  @type t :: %__MODULE__{
          devices_size: [SampledMetric.t()],
          devices_avail: [SampledMetric.t()],
          filesystems_size: [SampledMetric.t()],
          filesystems_avail: [SampledMetric.t()],
          swap_total: SampledMetric.t(),
          swap_avail: SampledMetric.t()
        }
end
