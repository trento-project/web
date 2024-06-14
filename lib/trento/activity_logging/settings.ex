defmodule Trento.ActivityLog.Settings do
  @moduledoc """
  ActivityLog Settings is the STI projection of activity log related settings
  """

  use Ecto.Schema
  use Trento.Support.Ecto.STI, sti_identifier: :activity_log_settings

  import Ecto.Changeset

  alias __MODULE__
  alias Trento.ActivityLog.RetentionTime

  @type t :: %__MODULE__{}

  @derive {Jason.Encoder, except: [:__meta__, :__struct__]}
  @primary_key {:id, :binary_id, autogenerate: true}
  schema "settings" do
    embeds_one :retention_time, RetentionTime,
      source: :activity_log_retention_time,
      on_replace: :update

    timestamps(type: :utc_datetime_usec)
    sti_fields()
  end

  @spec changeset(t() | Ecto.Changeset.t(), map) :: Ecto.Changeset.t()
  def changeset(settings, attrs) do
    settings
    |> cast(attrs, [])
    |> cast_embed(:retention_time, required: true)
    |> sti_changes()
    |> unique_constraint(:type)
  end

  def with_default_retention_time do
    changeset(%Settings{}, %{retention_time: RetentionTime.default()})
  end
end
