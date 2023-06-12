defmodule Trento.Domain.SapSystem.Application do
  @moduledoc """
  This module represents a SAP System application.
  """

  require Trento.Domain.Enums.EnsaVersion, as: EnsaVersion

  alias Trento.Domain.SapSystem.Instance

  @required_fields []

  use Trento.Type

  deftype do
    field :sid, :string
    field :ensa_version, Ecto.Enum, values: EnsaVersion.values(), default: EnsaVersion.no_ensa()
    embeds_many :instances, Instance
  end
end
