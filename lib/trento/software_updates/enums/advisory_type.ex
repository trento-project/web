defmodule Trento.SoftwareUpdates.Enums.AdvisoryType do
  @moduledoc """
  Enum representing possible advisory types.
  """

  @security_advisory "Security Advisory"
  @bugfix "Bug Fix Advisory"
  @enhancement "Product Enhancement Advisory"

  use Trento.Support.Enum, values: [:security_advisory, :bugfix, :enhancement]

  def from_string(@security_advisory), do: security_advisory()
  def from_string(@bugfix), do: bugfix()
  def from_string(@enhancement), do: enhancement()
  def from_string(_), do: bugfix()
end
