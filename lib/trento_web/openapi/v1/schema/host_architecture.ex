defmodule TrentoWeb.OpenApi.V1.Schema.HostArchitecture do
  @moduledoc false

  require OpenApiSpex
  require Trento.Hosts.Enums.Architecture, as: Architecture

  OpenApiSpex.schema(
    %{
      title: "HostArchitecture",
      type: :string,
      nullable: false,
      description: "Detected architecture of a host.",
      enum: Architecture.values(),
      example: "x86_64"
    },
    struct?: false
  )
end
