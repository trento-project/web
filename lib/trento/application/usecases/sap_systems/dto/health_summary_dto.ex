defmodule Trento.Application.UseCases.SapSystems.HealthSummaryDto do
  @moduledoc """
  HealthSummary for SAP Systems
  """

  @required_fields :all

  use Trento.Type

  require Trento.Domain.Enums.Health, as: Health

  deftype do
    field :id, :string
    field :sid, :string
    field :sapsystem_health, Ecto.Enum, values: Health.values()
    field :database_health, Ecto.Enum, values: Health.values()
    field :clusters_health, Ecto.Enum, values: Health.values()
    field :hana_cluster_id, :string
    field :database_id, :string
    field :hosts_health, Ecto.Enum, values: [:passing, :critical, :unknown]
  end
end
