defmodule Trento.Integration.Discovery.DiscardedDiscoveryEvent do
  @moduledoc """
  This module contains the schema used to store an append log of the discarded discovery events,
  for debugging and auditing purposes.
  No changeset is defined here, since the schema is used to store append-only data.
  """

  use Ecto.Schema

  @type t :: %__MODULE__{}

  schema "discarded_discovery_events" do
    field :payload, Ecto.Payload
    field :reason, :string

    timestamps(type: :utc_datetime_usec)
  end
end
