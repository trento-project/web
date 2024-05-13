defmodule TestDataWithValidation do
  @moduledoc false

  @required_fields :all

  use Trento.Support.Type

  deftype do
    field :password, :string
  end

  def changeset(changeset, attrs) do
    changeset
    |> cast(attrs, [:password])
    |> validate_length(:password, min: 8)
  end
end
