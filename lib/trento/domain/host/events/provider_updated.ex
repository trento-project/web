defmodule Trento.Domain.Events.ProviderUpdated do
  @moduledoc """
  This event is emitted when a provider data is updated in a specific host.
  """

  use Trento.Event

  alias Trento.Domain.AzureProvider

  defevent do
    field :host_id, Ecto.UUID
    field :provider, Ecto.Enum, values: [:azure, :unknown]
    embeds_one :provider_data, AzureProvider
  end
end
