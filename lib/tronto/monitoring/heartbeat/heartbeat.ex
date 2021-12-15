defmodule Tronto.Monitoring.Heartbeat do
  @moduledoc false

  use Ecto.Schema

  import Ecto.Changeset

  @type t :: %__MODULE__{}

  @primary_key {:agent_id, :string, autogenerate: false}
  schema "heartbeats" do
    field :timestamp, :utc_datetime_usec
  end

  @spec changeset(t() | Ecto.Changeset.t(), map) :: Ecto.Changeset.t()
  def changeset(heartbeat, attrs) do
    cast(heartbeat, attrs, [:agent_id, :timestamp])
  end
end
