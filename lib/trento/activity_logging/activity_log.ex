defmodule Trento.ActivityLog.ActivityLog do
  @moduledoc """
  ActivityLog represents an interesting activity that is tracked
  """
  use Ecto.Schema
  import Ecto.Changeset

  @type t() :: %__MODULE__{}

  @primary_key {:id, :binary_id, autogenerate: true}
  schema "activity_logs" do
    field :type, :string
    field :actor, :string
    field :metadata, :map

    timestamps(type: :utc_datetime_usec)
  end

  def changeset(activity_log, attrs) do
    activity_log
    |> cast(attrs, __MODULE__.__schema__(:fields))
    |> validate_required([:type, :actor, :metadata])
  end
end
