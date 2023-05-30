defmodule Trento.Domain.SapSystem.Database do
  @moduledoc """
  This module represents a SAP System database.
  """

  require Trento.Domain.Enums.Health, as: Health

  alias Trento.Domain.SapSystem.Instance

  @required_fields []

  use Trento.Type

  deftype do
    field :sid, :string
    embeds_many :instances, Instance
    field :deregistered_at, :utc_datetime_usec
    field :health, Ecto.Enum, values: Health.values()
  end
end
