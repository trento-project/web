# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule TrentoWeb.OpenApi.V1.Schema.Operations.SapSystemBulkStartStopParams do
  @moduledoc false
  require OpenApiSpex
  alias OpenApiSpex.Schema

  OpenApiSpex.schema(
    %{
      title: "SapSystemBulkStartStopParamsV1",
      description:
        "Represents the parameters for starting or stopping multiple SAP systems at once. The same parameters are applied to every SAP system.",
      type: :object,
      additionalProperties: false,
      example: %{
        sap_system_ids: [
          "d59523fc-0497-4b1e-9fdd-14aa7cda77f1",
          "e6a634fd-1508-4c2f-8aee-25bb8deb88a2"
        ],
        params: %{
          instance_type: "all",
          timeout: 300
        }
      },
      properties: %{
        sap_system_ids: %Schema{
          type: :array,
          description:
            "Unique identifiers of the SAP systems on which the operation is requested.",
          minItems: 1,
          uniqueItems: true,
          items: %Schema{type: :string, format: :uuid}
        },
        params: %Schema{
          type: :object,
          additionalProperties: false,
          properties: %{
            instance_type: %Schema{
              type: :string,
              description:
                "Specifies the type of SAP system instances to be started or stopped, supporting targeted operations.",
              example: "all"
            },
            timeout: %Schema{
              type: :integer,
              description:
                "The maximum time in seconds to wait for each SAP system to complete the start or stop operation.",
              example: 300
            }
          }
        }
      },
      required: [:sap_system_ids]
    },
    struct?: false
  )
end
