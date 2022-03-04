defmodule Tronto.Monitoring.HostReadModel do
  @moduledoc """
  Host read model
  """

  use Ecto.Schema

  import Ecto.Changeset

  alias Tronto.Monitoring.ClusterReadModel
  alias Tronto.Monitoring.ProviderReadModel

  @type t :: %__MODULE__{}

  @derive {Jason.Encoder, except: [:__meta__, :__struct__]}
  @primary_key {:id, :binary_id, autogenerate: false}
  schema "hosts" do
    field :hostname, :string
    field :ip_addresses, {:array, :string}
    field :agent_version, :string
    field :provider, :string
    field :cluster_id, Ecto.UUID
    field :heartbeat, Ecto.Enum, values: [:critical, :passing, :unknown]

    has_one :cluster, ClusterReadModel, references: :cluster_id, foreign_key: :id
    has_one :provider_data, ProviderReadModel, foreign_key: :host_id
  end

  @spec changeset(t() | Ecto.Changeset.t(), map) :: Ecto.Changeset.t()
  def changeset(host, attrs) do
    cast(host, attrs, __MODULE__.__schema__(:fields))
  end
end
