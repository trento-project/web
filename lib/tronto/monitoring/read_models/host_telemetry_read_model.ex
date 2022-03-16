defmodule Tronto.Monitoring.HostTelemetryReadModel do
  @moduledoc """
  HostTelemetry read model
  """

  use Ecto.Schema

  import Ecto.Changeset

  @type t :: %__MODULE__{}

  @derive {Jason.Encoder, except: [:__meta__, :__struct__]}
  @primary_key {:agent_id, :binary_id, autogenerate: false}
  schema "hosts_telemetry" do
    field :hostname, :string
    field :cpu_count, :integer
    field :socket_count, :integer
    field :total_memory_mb, :integer
    field :sles_version, :string
    field :provider, Ecto.Enum, values: [:azure, :unknown]

    timestamps()
  end

  @spec changeset(t() | Ecto.Changeset.t(), map) :: Ecto.Changeset.t()
  def changeset(host_telemetry, attrs) do
    cast(host_telemetry, attrs, __MODULE__.__schema__(:fields))
  end
end
