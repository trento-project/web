defmodule Trento.Settings.ApiKeySettings do
  @moduledoc """
    ApiKeySettings is the STI projection of api key related settings
    """
alias Trento.Settings.ApiKeySettings

  use Ecto.Schema
  use Trento.Support.Ecto.STI, sti_identifier: :api_key_settings

  import Ecto.Changeset

  @type t :: %__MODULE__{}

  @derive {Jason.Encoder, except: [:__meta__, :__struct__]}
  @primary_key {:id, :binary_id, autogenerate: false}
  schema "settings" do
    field :jti, :string
    field :api_key_created_at, :utc_datetime_usec
    field :api_key_expire_at, :utc_datetime_usec

    timestamps(type: :utc_datetime_usec)
    sti_fields()
  end

  @spec changeset(t() | Ecto.Changeset.t(), map) :: Ecto.Changeset.t()
  def changeset(system_settings, attrs) do
    system_settings
    |> cast(attrs, [:jti, :api_key_created_at, :api_key_expire_at])
    |> validate_required([:jti, :api_key_created_at])
    |> sti_changes()
    |> unique_constraint(:type)
  end
end
