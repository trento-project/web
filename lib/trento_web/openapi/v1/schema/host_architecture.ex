# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule TrentoWeb.OpenApi.V1.Schema.HostArchitecture do
  @moduledoc false

  require OpenApiSpex
  require Trento.Hosts.Enums.Architecture, as: Architecture

  OpenApiSpex.schema(
    %{
      title: "HostArchitectureV1",
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
