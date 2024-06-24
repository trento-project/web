defmodule Trento.ActivityLog.RetentionTime do
  @moduledoc """
  This module Represents the Activity Log Retention Time
  """

  @required_fields :all

  use Trento.Support.Type

  require Trento.ActivityLog.RetentionPeriodUnit, as: RetentionPeriodUnit

  alias __MODULE__

  deftype do
    field :value, :integer

    field :unit, Ecto.Enum, values: RetentionPeriodUnit.values()
  end

  @spec changeset(t() | Ecto.Changeset.t(), map) :: Ecto.Changeset.t()
  def changeset(retention_time, %RetentionTime{} = attrs),
    do: changeset(retention_time, Map.from_struct(attrs))

  def changeset(retention_time, attrs) do
    retention_time
    |> cast(attrs, [:value, :unit])
    |> validate_required([:value, :unit])
    |> validate_number(:value, greater_than: 0)
    |> validate_inclusion(:unit, RetentionPeriodUnit.values())
  end

  def default do
    %RetentionTime{
      value: 1,
      unit: RetentionPeriodUnit.month()
    }
  end
end
