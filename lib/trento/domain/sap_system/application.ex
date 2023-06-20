defmodule Trento.Domain.SapSystem.Application do
  @moduledoc """
  This module represents a SAP System application.
  """

  alias Trento.Domain.SapSystem.Instance

  @required_fields []

  use Trento.Type

  deftype do
    field :sid, :string
    embeds_many :instances, Instance
  end
end
