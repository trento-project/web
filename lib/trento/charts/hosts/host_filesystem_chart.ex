defmodule Trento.Charts.Hosts.HostFilesystemChart do
  @moduledoc """
  ...
  """

  @enforce_keys [:avail_size, :used_size]
  defstruct [:avail_size, :used_size]

  @type t :: %__MODULE__{
          avail_size: integer(),
          used_size: integer()
        }
end
