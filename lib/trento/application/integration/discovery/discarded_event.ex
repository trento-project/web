defmodule Trento.Integration.Discovery.DiscardedEvent do
  @moduledoc """
  This module contains the schema used to store an append log of the discarded events,
  for debugging and auditing purposes.
  No changeset is defined here, since the schema is used to store append-only data.
  """

  use Ecto.Schema

  @type t :: %__MODULE__{}

  schema "discarded_events" do
    field :payload, Ecto.Payload

    timestamps(type: :utc_datetime_usec)
  end
end
