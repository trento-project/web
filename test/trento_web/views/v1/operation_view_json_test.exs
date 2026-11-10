# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule TrentoWeb.V1.OperationJSONTest do
  use ExUnit.Case

  alias TrentoWeb.V1.OperationJSON

  test "should render bulk_operation_accepted.json" do
    bulk_operation_id = Faker.UUID.v4()
    operations = [%{resource_id: Faker.UUID.v4(), operation_id: Faker.UUID.v4()}]
    resource_id_1 = Faker.UUID.v4()
    resource_id_2 = Faker.UUID.v4()

    failed_requests = [
      %{resource_id: resource_id_1, reason: :operation_not_found},
      %{resource_id: resource_id_2, reason: {:error, %{detail: "boom"}}}
    ]

    assert %{
             bulk_operation_id: ^bulk_operation_id,
             operations: ^operations,
             failed_requests: [
               %{resource_id: ^resource_id_1, reason: ":operation_not_found"},
               %{resource_id: ^resource_id_2, reason: "{:error, %{detail: \"boom\"}}"}
             ]
           } =
             OperationJSON.bulk_operation_accepted(%{
               bulk_operation_id: bulk_operation_id,
               operations: operations,
               failed_requests: failed_requests
             })
  end
end
