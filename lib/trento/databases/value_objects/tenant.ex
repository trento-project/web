defmodule Trento.Databases.ValueObjects.Tenant do
  @moduledoc """
  Database tenant informations
  """
  @required_fields :all

  use Trento.Support.Type

  deftype do
    field :name, :string
  end
end
