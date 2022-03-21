defmodule Trento.Settings do
  @moduledoc false

  use Ecto.Schema

  import Ecto.Changeset

  @type t :: %__MODULE__{}

  @derive {Jason.Encoder, except: [:__meta__, :__struct__]}
  @primary_key {:installation_id, :binary_id, autogenerate: false}
  schema "settings" do
    field :eula_accepted, :boolean
  end

  @spec changeset(t() | Ecto.Changeset.t(), map) :: Ecto.Changeset.t()
  def changeset(system_settings, attrs) do
    cast(system_settings, attrs, [:installation_id, :eula_accepted])
  end
end
