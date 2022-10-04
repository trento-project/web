defmodule Trento.HostConnectionSettings do
  @moduledoc false

  use Ecto.Schema

  import Ecto.Changeset

  @type t :: %__MODULE__{}

  @primary_key {:id, :binary_id, autogenerate: false}
  schema "host_connection_settings" do
    field :user, :string
  end

  @spec changeset(t() | Ecto.Changeset.t(), map) :: Ecto.Changeset.t()
  def changeset(connection_settings, attrs) do
    connection_settings
    |> cast(attrs, [:id, :user])
    |> validate_required([:user])
  end
end
