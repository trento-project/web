defmodule Trento.ActivityLog.RetentionTime do
  @moduledoc """
  This module Represents the Activity Log Retention Time
  """

  @required_fields :all

  use Trento.Support.Type

  require Trento.ActivityLog.RetentionPeriodUnit, as: RetentionPeriodUnit

  alias __MODULE__

  deftype do
    field :retention_period, :integer

    field :retention_period_unit, Ecto.Enum, values: RetentionPeriodUnit.values()
  end

  @spec changeset(t() | Ecto.Changeset.t(), map) :: Ecto.Changeset.t()
  def changeset(retention_time, %RetentionTime{} = attrs),
    do: changeset(retention_time, Map.from_struct(attrs))

  def changeset(retention_time, attrs) do
    retention_time
    |> cast(attrs, [:retention_period, :retention_period_unit])
    |> validate_required([:retention_period, :retention_period_unit])
    |> validate_number(:retention_period, greater_than: 0)
    |> validate_inclusion(:retention_period_unit, RetentionPeriodUnit.values())
  end

  def default do
    %RetentionTime{
      retention_period: 1,
      retention_period_unit: RetentionPeriodUnit.months()
    }
  end
end
