defmodule Trento.Domain.Enums.EnsaVersion do
  @moduledoc """
  Type that represents the supported ENSA versions.
  """

  use Trento.Support.Enum, values: [:ensa1, :ensa2, nil]
end
