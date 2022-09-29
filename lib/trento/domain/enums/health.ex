defmodule Trento.Domain.Enum.Health do
  @moduledoc """
  Type that represents the possible health values in the system.
  """

  use Trento.Domain.Enum, values: [:passing, :warning, :critical, :unknown]
end
