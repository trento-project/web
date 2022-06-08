defmodule Trento.ClusterEnrichmentData do
  @moduledoc """
  Enriched cluster data
  """

  use Ecto.Schema

  import Ecto.Changeset

  @type t :: %__MODULE__{}

  @derive {Jason.Encoder, except: [:__meta__, :__struct__]}
  @primary_key {:cluster_id, :binary_id, autogenerate: false}
  schema "clusters_enrichment_data" do
    field :cib_last_written, :string
  end

  @spec changeset(t() | Ecto.Changeset.t(), map) :: Ecto.Changeset.t()
  def changeset(cluster, attrs) do
    cast(cluster, attrs, __MODULE__.__schema__(:fields))
  end
end
