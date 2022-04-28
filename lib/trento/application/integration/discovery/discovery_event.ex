defmodule Trento.Integration.Discovery.DiscoveryEvent do
  @moduledoc """
  This module contains the schema used to store an append log of the handled discovery events,
  for debugging and auditing purposes.
  No changeset is defined here, since the schema is used to store append-only data.
  """

  use Ecto.Schema

  @type t :: %__MODULE__{}

  schema "discovery_events" do
    field :agent_id, Ecto.UUID
    field :discovery_type, :string
    field :payload, Ecto.Payload

    timestamps([type: :utc_datetime_usec])
  end
end
