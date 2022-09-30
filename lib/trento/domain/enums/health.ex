defmodule Trento.Domain.Enums.Health do
  @moduledoc """
  Type that represents the possible health values in the system.
  """

  use Trento.Support.Enum, values: [:passing, :warning, :critical, :unknown]
end
