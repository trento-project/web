defmodule TrentoWeb.OpenApi.V1.Schema.SlesSubscription do
  @moduledoc false

  require OpenApiSpex
  alias OpenApiSpex.Schema

  OpenApiSpex.schema(%{
    title: "SlesSubscription",
    description: "A discovered SLES Subscription on a host",
    type: :object,
    properties: %{
      host_id: %Schema{type: :string, format: :uuid},
      identifier: %Schema{type: :string},
      version: %Schema{type: :string},
      arch: %Schema{type: :string},
      status: %Schema{type: :string},
      subscription_status: %Schema{type: :string},
      type: %Schema{type: :string},
      starts_at: %Schema{type: :string},
      expires_at: %Schema{type: :string}
    }
  })
end
