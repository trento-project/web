# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule TrentoWeb.OpenApi.V1.Schema.Operations.HostBulkRebootParams do
  @moduledoc false
  require OpenApiSpex
  alias OpenApiSpex.Schema

  OpenApiSpex.schema(
    %{
      title: "HostBulkRebootParamsV1",
      description: "Represents the parameters for rebooting multiple hosts at once.",
      type: :object,
      additionalProperties: false,
      example: %{
        host_ids: [
          "d59523fc-0497-4b1e-9fdd-14aa7cda77f1",
          "e6a634fd-1508-4c2f-8aee-25bb8deb88a2"
        ]
      },
      properties: %{
        host_ids: %Schema{
          type: :array,
          description: "Unique identifiers of the hosts on which the operation is requested.",
          minItems: 1,
          uniqueItems: true,
          items: %Schema{type: :string, format: :uuid}
        }
      },
      required: [:host_ids]
    },
    struct?: false
  )
end
