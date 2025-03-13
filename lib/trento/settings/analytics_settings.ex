defmodule Trento.Settings.AnalyticsSettings do
  @moduledoc """
  Settings related to analytics.
  """

  use Ecto.Schema
  use Trento.Support.Ecto.STI, sti_identifier: :analytics_settings

  import Ecto.Changeset

  @type t :: %__MODULE__{}

  @derive {Jason.Encoder, except: [:__meta__, :__struct__]}
  @primary_key {:id, :binary_id, autogenerate: true}
  schema "settings" do
    field :opt_in, :boolean, source: :analytics_settings_opt_in, default: false

    timestamps(type: :utc_datetime_usec)
    sti_fields()
  end

  @spec changeset(t() | Ecto.Changeset.t(), map) :: Ecto.Changeset.t()
  def changeset(settings, attrs) do
    settings
    |> cast(attrs, [:opt_in])
    |> validate_required([:opt_in])
    |> sti_changes()
    |> unique_constraint(:type)
  end
end
