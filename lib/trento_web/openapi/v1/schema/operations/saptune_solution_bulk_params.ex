# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule TrentoWeb.OpenApi.V1.Schema.Operations.SaptuneSolutionBulkParams do
  @moduledoc false
  require OpenApiSpex
  require Trento.Hosts.Enums.SaptuneSolutionFamily, as: SaptuneSolutionFamily

  alias OpenApiSpex.Schema

  OpenApiSpex.schema(
    %{
      title: "SaptuneSolutionBulkParamsV1",
      description:
        "Represents the parameters for applying or changing the Saptune solution of multiple hosts at once. The solution applied in each host depends on its SAP workload and the requested solution family.",
      type: :object,
      additionalProperties: false,
      example: %{
        host_ids: [
          "d59523fc-0497-4b1e-9fdd-14aa7cda77f1",
          "e6a634fd-1508-4c2f-8aee-25bb8deb88a2"
        ],
        params: %{
          solution_family: SaptuneSolutionFamily.netweaver()
        }
      },
      properties: %{
        host_ids: %Schema{
          type: :array,
          description: "Unique identifiers of the hosts on which the operation is requested.",
          minItems: 1,
          uniqueItems: true,
          items: %Schema{type: :string, format: :uuid}
        },
        params: %Schema{
          type: :object,
          additionalProperties: false,
          properties: %{
            solution_family: %Schema{
              type: :string,
              enum: SaptuneSolutionFamily.values(),
              description:
                "Family of solutions to apply. netweaver applies HANA, NETWEAVER or NETWEAVER+HANA, and s4hana applies S4HANA-DBSERVER, S4HANA-APPSERVER or S4HANA-APP+DB, depending on the SAP workload of each host."
            }
          },
          required: [:solution_family]
        }
      },
      required: [:host_ids, :params]
    },
    struct?: false
  )
end
