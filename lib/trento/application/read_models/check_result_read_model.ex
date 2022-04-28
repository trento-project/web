defmodule Trento.CheckResultReadModel do
  @moduledoc """
  Check result read model
  """

  use Ecto.Schema

  import Ecto.Changeset

  @type t :: %__MODULE__{}

  @derive {Jason.Encoder, except: [:__meta__, :__struct__]}
  @primary_key false
  schema "checks_results" do
    field :cluster_id, Ecto.UUID, primary_key: true
    field :host_id, Ecto.UUID, primary_key: true
    field :check_id, :string, primary_key: true
    field :result, Ecto.Enum, values: [:passing, :warning, :critical, :skipped, :unknown]

    timestamps([type: :utc_datetime_usec])
  end

  @spec changeset(t() | Ecto.Changeset.t(), map) :: Ecto.Changeset.t()
  def changeset(check_result, attrs) do
    cast(check_result, attrs, __MODULE__.__schema__(:fields))
  end
end
