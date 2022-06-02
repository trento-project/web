defmodule Trento.ClusterReadModel do
  @moduledoc """
  Cluster read model
  """

  use Ecto.Schema

  import Ecto.Changeset

  alias Trento.{
    CheckResultReadModel,
    HostChecksExecutionsReadModel
  }

  @type t :: %__MODULE__{}

  @derive {Jason.Encoder, except: [:__meta__, :__struct__]}
  @primary_key {:id, :binary_id, autogenerate: false}
  schema "clusters" do
    field :name, :string, default: ""
    field :sid, :string
    field :provider, Ecto.Enum, values: [:azure, :aws, :gcp, :unknown]
    field :type, Ecto.Enum, values: [:hana_scale_up, :hana_scale_out, :unknown]
    field :selected_checks, {:array, :string}, default: []
    field :health, Ecto.Enum, values: [:passing, :warning, :critical, :unknown]
    field :resources_number, :integer
    field :hosts_number, :integer
    field :details, :map
    field :cib_last_written, :string
    field :checks_execution, Ecto.Enum, values: [:not_running, :requested, :running]

    has_many :hosts_executions, HostChecksExecutionsReadModel, foreign_key: :cluster_id
    has_many :checks_results, CheckResultReadModel, foreign_key: :cluster_id
    has_many :tags, Trento.Tag, foreign_key: :resource_id
  end

  @spec changeset(t() | Ecto.Changeset.t(), map) :: Ecto.Changeset.t()
  def changeset(cluster, attrs) do
    cast(cluster, attrs, __MODULE__.__schema__(:fields))
  end
end
