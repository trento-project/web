defmodule Trento.Databases.Events.DatabaseTenantsUpdated do
  @moduledoc """
  This event is emitted when the tenants of a database are updated
  """

  use Trento.Support.Event

  alias Trento.Databases.ValueObjects.Tenant

  defevent do
    field :database_id, Ecto.UUID

    embeds_many :tenants, Tenant
    embeds_many :previous_tenants, Tenant
  end
end
