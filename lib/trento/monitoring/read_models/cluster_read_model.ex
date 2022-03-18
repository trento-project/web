defmodule Trento.Monitoring.ClusterReadModel do
  @moduledoc """
  Cluster read model
  """

  use Ecto.Schema

  import Ecto.Changeset

  alias Trento.Monitoring.CheckResultReadModel

  @type t :: %__MODULE__{}

  @derive {Jason.Encoder, except: [:__meta__, :__struct__]}
  @primary_key {:id, :binary_id, autogenerate: false}
  schema "clusters" do
    field :name, :string
    field :sid, :string
    field :type, Ecto.Enum, values: [:hana_scale_up, :hana_scale_down, :unknown]
    field :selected_checks, {:array, :string}, default: []
    field :health, Ecto.Enum, values: [:passing, :warning, :critical, :pending, :unknown]
    field :details, :map

    has_many :checks_results, CheckResultReadModel, foreign_key: :cluster_id
    has_many :tags, Trento.Monitoring.Tag, foreign_key: :resource_id
  end

  @spec changeset(t() | Ecto.Changeset.t(), map) :: Ecto.Changeset.t()
  def changeset(cluster, attrs) do
    cast(cluster, attrs, __MODULE__.__schema__(:fields))
  end
end
