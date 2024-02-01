defmodule Trento.SoftwareUpdates.Settings do
  @moduledoc """
  Schema for software updates settings.
  """

  use Ecto.Schema

  import Ecto.Changeset

  @type t :: %__MODULE__{}

  @primary_key {:id, :binary_id, autogenerate: false}
  schema "software_update_settings" do
    field :url, :string
    field :username, :string
    field :password, Trento.Support.Ecto.EncryptedBinary
    field :ca_cert, Trento.Support.Ecto.EncryptedBinary
    field :ca_uploaded_at, :utc_datetime_usec

    timestamps(type: :utc_datetime_usec)
  end

  @spec changeset(t() | Ecto.Changeset.t(), map) :: Ecto.Changeset.t()
  def changeset(software_update_settings, attrs) do
    software_update_settings
    |> cast(attrs, __MODULE__.__schema__(:fields))
    |> validate_required([:url, :username, :password])
    |> unique_constraint(:id, name: :software_update_settings_pkey)
  end
end
