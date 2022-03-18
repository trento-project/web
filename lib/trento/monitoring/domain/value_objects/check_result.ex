defmodule Trento.Monitoring.Domain.CheckResult do
  @moduledoc """
  Check result value object
  """
  use TypedStruct
  use Domo

  @type result :: :passing | :warning | :critical | :running

  @derive Jason.Encoder
  typedstruct do
    @typedoc "CheckResult value object"

    field :check_id, String.t(), enforce: true
    field :result, result, enforce: true
  end
end
