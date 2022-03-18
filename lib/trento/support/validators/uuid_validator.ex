defmodule Trento.Support.UUIDValidator do
  @moduledoc """
  Ensure a value is a valid UUID string.
  """

  use Vex.Validator

  def validate(value, _options), do: Vex.Validators.Uuid.validate(value, format: :default)
end
