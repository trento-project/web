defmodule Trento.Monitoring.SlesSubscriptionReadModel do
  @moduledoc """
  SLES subscriptions read model
  """

  use Ecto.Schema

  import Ecto.Changeset

  @type t :: %__MODULE__{}

  @derive {Jason.Encoder, except: [:__meta__, :__struct__]}
  @primary_key false
  schema "sles_subscriptions" do
    field :host_id, Ecto.UUID, primary_key: true
    field :identifier, :string, primary_key: true
    field :version, :string
    field :arch, :string
    field :status, :string
    field :subscription_status, :string
    field :type, :string
    field :starts_at, :string
    field :expires_at, :string

    timestamps()
  end

  @spec changeset(t() | Ecto.Changeset.t(), map) :: Ecto.Changeset.t()
  def changeset(sles_subscription, attrs) do
    cast(sles_subscription, attrs, __MODULE__.__schema__(:fields))
  end
end
