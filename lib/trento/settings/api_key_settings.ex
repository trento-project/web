defmodule Trento.Settings.ApiKeySettings do
  @moduledoc """
  ApiKeySettings is the STI projection of api key related settings
  """

  use Ecto.Schema
  use Trento.Support.Ecto.STI, sti_identifier: :api_key_settings

  import Ecto.Changeset

  defdelegate authorize(action, user, params), to: Trento.Settings.Policy

  @type t :: %__MODULE__{}

  @derive {Jason.Encoder, except: [:__meta__, :__struct__]}
  @primary_key {:id, :binary_id, autogenerate: true}
  schema "settings" do
    field :jti, Ecto.UUID, source: :api_key_settings_jti
    field :created_at, :utc_datetime_usec, source: :api_key_settings_created_at
    field :expire_at, :utc_datetime_usec, source: :api_key_settings_expire_at

    timestamps(type: :utc_datetime_usec)
    sti_fields()
  end

  @spec changeset(t() | Ecto.Changeset.t(), map) :: Ecto.Changeset.t()
  def changeset(system_settings, attrs) do
    system_settings
    |> cast(attrs, [:jti, :created_at, :expire_at])
    |> validate_required([:jti, :created_at])
    |> sti_changes()
    |> unique_constraint(:type)
  end
end
