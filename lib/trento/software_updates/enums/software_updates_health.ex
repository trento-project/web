defmodule Trento.SoftwareUpdates.Enums.SoftwareUpdatesHealth do
  @moduledoc """
  Type that represents the possible health values for the software updates discovery process.
  """

  use Trento.Support.Enum, values: [:passing, :warning, :critical, :unknown, :not_set]
end
