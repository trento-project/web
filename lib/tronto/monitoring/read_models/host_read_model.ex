defmodule Tronto.Monitoring.HostReadModel do
  @moduledoc """
  Host read model
  """

  use Ecto.Schema

  import Ecto.Changeset

  @type t :: %__MODULE__{}

  @derive {Jason.Encoder, except: [:__meta__, :__struct__]}
  @primary_key {:id, :binary_id, autogenerate: false}
  schema "hosts" do
    field :hostname, :string
    field :ip_addresses, {:array, :string}
    field :agent_version, :string
    field :provider, :string
    field :heartbeat, Ecto.Enum, values: [:critical, :passing, :unknown]
  end

  @spec changeset(t() | Ecto.Changeset.t(), map) :: Ecto.Changeset.t()
  def changeset(host, attrs) do
    cast(host, attrs, __MODULE__.__schema__(:fields))
  end
end
