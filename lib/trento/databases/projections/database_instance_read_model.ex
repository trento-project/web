defmodule Trento.Databases.Projections.DatabaseInstanceReadModel do
  @moduledoc """
  Database instance read model
  """

  use Ecto.Schema

  import Ecto.Changeset

  require Trento.Enums.Health, as: Health

  @type t :: %__MODULE__{}

  alias Trento.Hosts.Projections.HostReadModel

  @derive {Jason.Encoder, except: [:__meta__, :__struct__]}
  @primary_key false
  schema "database_instances" do
    field :database_id, Ecto.UUID, primary_key: true
    field :sid, :string
    field :instance_number, :string, primary_key: true
    field :instance_hostname, :string
    field :features, :string
    field :http_port, :integer
    field :https_port, :integer
    field :start_priority, :string
    field :system_replication, :string, default: ""
    field :system_replication_status, :string, default: ""
    field :health, Ecto.Enum, values: Health.values()
    field :absent_at, :utc_datetime_usec

    belongs_to :host, HostReadModel,
      references: :id,
      foreign_key: :host_id,
      primary_key: true,
      type: Ecto.UUID,
      where: [deregistered_at: nil]

    timestamps(type: :utc_datetime_usec)
  end

  @spec changeset(t() | Ecto.Changeset.t(), map) :: Ecto.Changeset.t()
  def changeset(database_instance, attrs) do
    cast(database_instance, attrs, __MODULE__.__schema__(:fields))
  end
end
