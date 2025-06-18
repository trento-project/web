defmodule TrentoWeb.OpenApi.V1.Schema.HostArchitecture do
  @moduledoc false

  require OpenApiSpex
  require Trento.Hosts.Enums.Architecture, as: Architecture

  OpenApiSpex.schema(
    %{
      title: "Host Architecture",
      type: :string,
      nullable: false,
      description: "Detected architecture of a host",
      enum: Architecture.values()
    },
    struct?: false
  )
end
