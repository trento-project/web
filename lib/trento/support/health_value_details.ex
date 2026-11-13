# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Support.HealthValueDetails do
  @moduledoc """
  Represent Health value with additional details.
  """
  @required_fields [:value]

  use Trento.Support.Type

  require Trento.Enums.Health, as: Health

  alias Trento.Support.StructHelper

  deftype do
    field :value, Ecto.Enum, values: Health.values(), default: Health.unknown()
    field :reason, :string, default: ""
  end

  @spec to_details_map(map()) :: map()
  @doc """
    Utility function that converts a mapping (struct or map) of Health values into a Map of HealthValueDetails
  """
  def to_details_map(nil), do: nil

  def to_details_map(health_mapping) do
    health_mapping
    |> StructHelper.to_map()
    |> Map.new(fn {key, value} -> {key, %{value: value}} end)
  end
end
