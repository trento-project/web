defmodule Trento.ActivityLog.RetentionPeriodUnit do
  @moduledoc """
  Type that represents the possible retention period units.
  """

  use Trento.Support.Enum, values: [:days, :weeks, :months, :years]
end
