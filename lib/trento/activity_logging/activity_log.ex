defmodule Trento.ActivityLog.ActivityLog do
  @moduledoc """
  ActivityLog represents an interesting activity that is tracked
  """
  use Ecto.Schema
  import Ecto.Changeset

  @type t() :: %__MODULE__{}

  @derive {
    Flop.Schema,
    filterable: [:type, :actor, :severity, :inserted_at],
    sortable: [:type, :actor, :inserted_at],
    max_limit: 100,
    default_limit: 25,
    default_order: %{
      order_by: [:inserted_at],
      order_directions: [:desc]
    },
    pagination_types: [:first, :last],
    default_pagination_type: :first
  }

  @primary_key {:id, :binary_id, autogenerate: true}
  schema "activity_logs" do
    field :type, :string
    field :actor, :string
    field :metadata, :map
    field :severity, :integer

    timestamps(type: :utc_datetime_usec)
  end

  @severity_min 1
  @severity_max 24
  def changeset(activity_log, attrs) do
    activity_log
    |> cast(attrs, __MODULE__.__schema__(:fields))
    |> validate_required([:type, :actor, :metadata, :severity])
    |> validate_inclusion(:severity, @severity_min..@severity_max)
  end
end
