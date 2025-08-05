defmodule TrentoWeb.OpenApi.V1.Schema.ResourceHealth do
  @moduledoc false

  require OpenApiSpex
  require Trento.Enums.Health, as: Health

  OpenApiSpex.schema(
    %{
      title: "ResourceHealth",
      type: :string,
      nullable: true,
      description:
        "Represents the detected health status of a resource, indicating whether it is passing, critical, or unknown for monitoring and alerting purposes.",
      enum: Health.values(),
      example: "passing"
    },
    struct?: false
  )
end
