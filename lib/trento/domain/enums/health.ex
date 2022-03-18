defmodule Trento.Domain.Health do
  @moduledoc """
  Type that represents the possible health values in the system.
  """

  @type t :: :passing | :warning | :critical | :unknown
end
