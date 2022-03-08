defmodule Tronto.Monitoring.Domain.Events.ProviderUpdated do
  @moduledoc """
  This event is emitted when a provider data is updated in a specific host.
  """

  alias Tronto.Monitoring.Domain.{
    AzureProvider
  }

  use TypedStruct

  @derive Jason.Encoder
  typedstruct do
    @typedoc "ProviderUpdated event"

    field :host_id, String.t(), enforce: true
    field :provider, String.t(), enforce: true
    field :provider_data, AzureProvider.t()
  end
end
