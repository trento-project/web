defmodule Trento.Monitoring.Domain.Commands.UpdateProvider do
  @moduledoc """
  Update the provider to a specific host.
  """

  alias Trento.Monitoring.Domain.AzureProvider

  use TypedStruct
  use Domo

  @type provider :: :azure | :unknown

  typedstruct do
    @typedoc "UpdateProvider command"

    field :host_id, String.t(), enforce: true
    field :provider, provider, enforce: true
    field :provider_data, AzureProvider.t() | nil
  end

  use Vex.Struct

  validates :host_id, uuid: true
end
