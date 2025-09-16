defmodule TrentoWeb.OpenApi.V1.Schema.HostArchitecture do
  @moduledoc false

  require OpenApiSpex
  require Trento.Hosts.Enums.Architecture, as: Architecture

  OpenApiSpex.schema(
    %{
      title: "HostArchitecture",
      type: :string,
      nullable: false,
      description:
        "Represents the detected architecture type of a host, such as x86_64 or arm64, supporting compatibility and infrastructure management.",
      enum: Architecture.values(),
      example: "x86_64"
    },
    struct?: false
  )
end
