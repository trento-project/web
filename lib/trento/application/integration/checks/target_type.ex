defmodule Trento.Integration.Checks.TargetType do
  @moduledoc """
  Type that represents the possible target types for a check execution.
  """

  use Trento.Support.Enum, values: [:cluster, :host]

  def from_string("cluster"), do: cluster()
  def from_string("host"), do: host()
  def from_string(_), do: nil

  def to_string(cluster()), do: "cluster"
  def to_string(host()), do: "host"
  def to_string(_), do: nil
end
