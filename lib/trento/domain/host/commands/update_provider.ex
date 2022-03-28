defmodule Trento.Domain.Commands.UpdateProvider do
  @moduledoc """
  Update the provider to a specific host.
  """

  @required_fields [:host_id]

  use Trento.Command

  alias Trento.Domain.AzureProvider

  defcommand do
    field :host_id, Ecto.UUID
    field :provider, Ecto.Enum, values: [:azure, :unknown]

    embeds_one :provider_data, AzureProvider
  end
end
