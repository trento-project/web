# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Checks.Frequency do
  @moduledoc """
  How often the checks run periodically on every target, such as hosts and clusters:
  every 5, 15 or 30 minutes, every 1, 6, 12 or 24 hours, or every 1, 2 or 4 weeks.
  """

  @required_fields :all

  use Trento.Support.Type

  require Trento.Checks.Enums.FrequencyUnit, as: FrequencyUnit

  alias __MODULE__

  @allowed_values [
    minute: [5, 15, 30],
    hour: [1, 6, 12, 24],
    week: [1, 2, 4]
  ]

  @unit_suffixes [minute: "m", hour: "h", week: "w"]

  deftype do
    field :value, :integer

    field :unit, Ecto.Enum, values: FrequencyUnit.values()
  end

  @spec changeset(t() | Ecto.Changeset.t(), map) :: Ecto.Changeset.t()
  def changeset(frequency, attrs) do
    frequency
    |> cast(attrs, [:value, :unit])
    |> validate_required([:value, :unit])
    |> validate_allowed_value()
  end

  @doc """
  The frequencies a user can choose, from the most to the least frequent.
  """
  @spec allowed() :: [t()]
  def allowed do
    for {unit, values} <- @allowed_values, value <- values do
      %Frequency{value: value, unit: unit}
    end
  end

  @spec default() :: t()
  def default do
    %Frequency{
      value: 5,
      unit: FrequencyUnit.minute()
    }
  end

  @spec to_minutes(t()) :: pos_integer()
  def to_minutes(%Frequency{value: value, unit: :minute}), do: value
  def to_minutes(%Frequency{value: value, unit: :hour}), do: value * 60
  def to_minutes(%Frequency{value: value, unit: :week}), do: value * 7 * 24 * 60

  @doc """
  Parses the compact notation of a frequency: a value followed by `m`, `h` or `w`, like
  `5m`, `6h` or `2w`, or a plain number of minutes matching an allowed frequency, like `60`.
  The frequency goes through the same validation as the other inputs. `disabled` means
  that the checks do not run periodically.
  """
  @spec parse(String.t()) :: {:ok, t() | :disabled} | {:error, :invalid_frequency}
  def parse("disabled"), do: {:ok, :disabled}

  def parse(notation) do
    case Integer.parse(notation) do
      {minutes, ""} -> from_minutes(minutes)
      {value, suffix} -> from_value_and_suffix(value, suffix)
      :error -> {:error, :invalid_frequency}
    end
  end

  @doc """
  Writes the compact notation of a frequency, like `6h`, or `disabled`, which parse/1 reads
  back.
  """
  @spec format(t() | :disabled) :: String.t()
  def format(:disabled), do: "disabled"

  def format(%Frequency{value: value, unit: unit}),
    do: "#{value}#{Keyword.fetch!(@unit_suffixes, unit)}"

  @doc """
  Writes disabled and the compact notation of the allowed frequencies, comma separated.
  """
  @spec format_allowed() :: String.t()
  def format_allowed, do: Enum.map_join([:disabled | allowed()], ", ", &format/1)

  defp from_minutes(minutes) do
    case Enum.find(allowed(), &(to_minutes(&1) == minutes)) do
      %Frequency{} = frequency -> {:ok, frequency}
      nil -> {:error, :invalid_frequency}
    end
  end

  defp from_value_and_suffix(value, suffix) do
    with {unit, _suffix} <- List.keyfind(@unit_suffixes, suffix, 1),
         {:ok, frequency} <- new(%{value: value, unit: unit}) do
      {:ok, frequency}
    else
      _ -> {:error, :invalid_frequency}
    end
  end

  defp validate_allowed_value(changeset) do
    unit = get_field(changeset, :unit)

    case Keyword.fetch(@allowed_values, unit) do
      {:ok, values} ->
        validate_inclusion(changeset, :value, values,
          message: "must be one of #{Enum.join(values, ", ")} when the unit is #{unit}"
        )

      :error ->
        changeset
    end
  end
end
