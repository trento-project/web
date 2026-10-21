defmodule Trento.Support.HealthValueDetails do
  @moduledoc """
  ValueDetails struct with Trento.Enums.Health as `value` field type.
  """
  require Trento.Enums.Health, as: Health
  require Trento.Support.ValueDetails, as: ValueDetails

  use ValueDetails,
    value_type: Ecto.Enum,
    values: Health.values(),
    default: Health.unknown()
end
