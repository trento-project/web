defmodule Trento.SapSystems.Projections.ApplicationInstanceReadModel do
  @moduledoc """
  Application instance read model
  """

  use Ecto.Schema

  import Ecto.Changeset

  require Trento.Enums.Health, as: Health

  @type t :: %__MODULE__{}

  alias Trento.Hosts.Projections.HostReadModel

  defdelegate authorize_operation(action, application_instance, params),
    to: Trento.Operations.ApplicationInstancePolicy

  @derive {Jason.Encoder, except: [:__meta__, :__struct__]}
  @primary_key false
  schema "application_instances" do
    field :sap_system_id, Ecto.UUID, primary_key: true
    field :sid, :string
    field :instance_number, :string, primary_key: true
    field :instance_hostname, :string
    field :features, :string
    field :http_port, :integer
    field :https_port, :integer
    field :start_priority, :string
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
  def changeset(application_instance, attrs) do
    cast(application_instance, attrs, __MODULE__.__schema__(:fields))
  end
end
