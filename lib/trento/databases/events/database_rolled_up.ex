defmodule Trento.Databases.Events.DatabaseRolledUp do
  @moduledoc """
  This event is emitted when a database roll-up is requested.
  It is used to trigger the stream archiving process and it contains the snapshot of the database aggregate.
  """

  use Trento.Support.Event

  defevent resource: "database", version: 2 do
    field :database_id, Ecto.UUID
    embeds_one :snapshot, Trento.Databases.Database
  end

  # Handle old SapSystemRolledUp, inherited from the previous aggregate when
  # database and sap system were together
  def upcast(
        %{
          "sap_system_id" => database_id,
          "snapshot" => %{
            "database" => %{
              "sid" => sid,
              "health" => health,
              "instances" => instances,
              "deregistered_at" => deregistered_at
            }
          }
        },
        _,
        2
      ) do
    %{
      "database_id" => database_id,
      "snapshot" => %{
        "database_id" => database_id,
        "sid" => sid,
        "health" => health,
        "instances" => instances,
        "deregistered_at" => deregistered_at
      }
    }
  end

  def upcast(params, _, 2), do: params
end
