defmodule Trento.Settings.InstallationSettings do
  @moduledoc """
  InstallationSettings is the STI projection containing installation related settings
  """

  use Ecto.Schema
  use Trento.Support.Ecto.STI, sti_identifier: :installation_settings

  import Ecto.Changeset

  @type t :: %__MODULE__{}

  @derive {Jason.Encoder, except: [:__meta__, :__struct__]}
  @primary_key {:id, :binary_id, autogenerate: true}
  schema "settings" do
    # field :eula_accepted, :boolean, source: :installation_settings_eula_accepted
    field :installation_id, :binary_id, source: :installation_settings_installation_id

    timestamps(type: :utc_datetime_usec)
    sti_fields()
  end

  @spec changeset(t() | Ecto.Changeset.t(), map) :: Ecto.Changeset.t()
  def changeset(system_settings, attrs) do
    system_settings
    |> cast(attrs, [:installation_id, :eula_accepted])
    |> validate_required(:installation_id)
    |> sti_changes()
    |> unique_constraint(:type)
  end
end
