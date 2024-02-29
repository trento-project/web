defmodule Trento.Hosts.ValueObjects.RelevantPatches do
  @moduledoc """
  Represents a host's relevant patches counts
  """

  @required_fields nil

  use Trento.Support.Type

  deftype do
    field :security_advisories, :integer, default: 0
    field :bug_fixes, :integer, default: 0
    field :software_enhancements, :integer, default: 0
  end
end
