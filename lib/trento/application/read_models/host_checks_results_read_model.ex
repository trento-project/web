defmodule Trento.HostChecksExecutionsReadModel do
  @moduledoc """
  Host checks executions read model
  """

  use Ecto.Schema

  import Ecto.Changeset

  @type t :: %__MODULE__{}

  @derive {Jason.Encoder, except: [:__meta__, :__struct__]}
  @primary_key false
  schema "hosts_checks_results" do
    field :cluster_id, Ecto.UUID, primary_key: true
    field :host_id, Ecto.UUID, primary_key: true
    field :reachable, :boolean
    field :msg, :string
  end

  @spec changeset(t() | Ecto.Changeset.t(), map) :: Ecto.Changeset.t()
  def changeset(host_checks_results, attrs) do
    cast(host_checks_results, attrs, __MODULE__.__schema__(:fields))
  end
end
