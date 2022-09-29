defmodule Trento.DatabaseInstanceReadModel do
  @moduledoc """
  Database instance read model
  """

  use Ecto.Schema

  import Ecto.Changeset

  require Trento.Domain.Enum.Health, as: Health

  @type t :: %__MODULE__{}

  alias Trento.HostReadModel

  @derive {Jason.Encoder, except: [:__meta__, :__struct__]}
  @primary_key false
  schema "database_instances" do
    field :sap_system_id, Ecto.UUID, primary_key: true
    field :sid, :string
    field :tenant, :string
    field :instance_number, :string, primary_key: true
    field :instance_hostname, :string
    field :features, :string
    field :http_port, :integer
    field :https_port, :integer
    field :start_priority, :string
    field :host_id, Ecto.UUID, primary_key: true
    field :system_replication, :string, default: ""
    field :system_replication_status, :string, default: ""
    field :health, Ecto.Enum, values: Health.values()

    has_one :host, HostReadModel, references: :host_id, foreign_key: :id
  end

  @spec changeset(t() | Ecto.Changeset.t(), map) :: Ecto.Changeset.t()
  def changeset(database_instance, attrs) do
    cast(database_instance, attrs, __MODULE__.__schema__(:fields))
  end
end
