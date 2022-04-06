defmodule Trento.Application.UseCases.SapSystems.HealthSummaryDto do
  @moduledoc """
  HealthSummary for SAP Systems
  """

  @required_fields :all

  use Trento.Type

  deftype do
    field :id, :string
    field :sid, :string
    field :sapsystem_health, Ecto.Enum, values: [:passing, :warning, :critical, :unknown]
    field :database_health, Ecto.Enum, values: [:passing, :warning, :critical, :unknown]
    field :clusters_health, Ecto.Enum, values: [:passing, :warning, :critical, :unknown]
    field :hosts_health, Ecto.Enum, values: [:passing, :critical, :unknown]
  end
end
