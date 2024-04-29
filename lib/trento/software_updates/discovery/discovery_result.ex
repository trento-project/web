defmodule Trento.SoftwareUpdates.Discovery.DiscoveryResult do
  @moduledoc """
  This is the schema used to store the results of the software updates discovery process.
  """

  use Ecto.Schema
  import Ecto.Changeset

  @type t :: %__MODULE__{}

  @primary_key {:host_id, :binary_id, autogenerate: false}
  schema "software_updates_discovery_result" do
    field :system_id, :string
    field :relevant_patches, Trento.Support.Ecto.Payload
    field :upgradable_packages, Trento.Support.Ecto.Payload
    field :failure_reason, :string

    timestamps(type: :utc_datetime_usec)
  end

  def changeset(discovery_result, attrs) do
    cast(discovery_result, attrs, __MODULE__.__schema__(:fields))
  end
end
