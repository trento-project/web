defmodule Trento.Databases.ValueObjects.Tenant do
  @moduledoc """
  Database tenant information
  """
  @required_fields :all

  use Trento.Support.Type

  deftype do
    field :name, :string
  end
end
