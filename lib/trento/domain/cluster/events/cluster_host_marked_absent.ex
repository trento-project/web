defmodule Trento.Domain.Events.ClusterHostMarkedAbsent do
  @moduledoc """
  This event is emitted when a cluster host is marked as absent
  """
  @required_fields :all

  use Trento.Event

  defevent do
    field :host_id, Ecto.UUID
    field :cluster_id, Ecto.UUID
    field :absent, :utc_datetime_usec
  end
end
