# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Support.OperationsHelperTest do
  use ExUnit.Case

  alias Trento.Support.OperationsHelper

  describe "reduce_operation_authorizations" do
    test "should reduce authorizations results" do
      scenarios = [
        %{
          authorizations: [:ok, :ok],
          acc: :ok,
          result: :ok
        },
        %{
          authorizations: [
            :ok,
            {:error, ["error2"]},
            {:error, ["error3", "error4"]},
            :ok,
            {:error, ["error2"]}
          ],
          acc: {:error, ["error1"]},
          result: {:error, ["error1", "error2", "error3", "error4"]}
        }
      ]

      for %{authorizations: authorizations, acc: acc, result: result} <- scenarios do
        assert result == OperationsHelper.reduce_operation_authorizations(authorizations, acc)
      end
    end

    test "should reduce authorizations results with default acc" do
      assert {:error, ["error1"]} ==
               OperationsHelper.reduce_operation_authorizations([{:error, ["error1"]}, :ok])
    end

    test "should reduce authorizations results with functions" do
      assert {:error, ["error1", "error2", "error3"]} ==
               OperationsHelper.reduce_operation_authorizations([1, 2, 3], :ok, fn index ->
                 {:error, ["error#{index}"]}
               end)
    end
  end

  describe "reduce_bulk_operation_request" do
    test "should return a bulk operation id and the operations" do
      resource_ids = [UUID.uuid4(), UUID.uuid4(), UUID.uuid4()]
      operation_ids = Map.new(resource_ids, &{&1, UUID.uuid4()})

      assert {:ok, _bulk_operation_id, operations, []} =
               OperationsHelper.reduce_bulk_operation_request(resource_ids, fn resource_id ->
                 {:ok, Map.fetch!(operation_ids, resource_id)}
               end)

      expected_operations =
        Enum.map(resource_ids, fn resource_id ->
          %{resource_id: resource_id, operation_id: operation_ids[resource_id]}
        end)

      assert expected_operations == operations
    end

    test "should return an empty operations list when there are no resources" do
      assert {:ok, _bulk_operation_id, [], []} =
               OperationsHelper.reduce_bulk_operation_request([], fn _ ->
                 flunk("request function should not be called")
               end)
    end

    test "should continue after an error and return the failed requests" do
      operation_id_a = UUID.uuid4()
      operation_id_c = UUID.uuid4()

      assert {:ok, _bulk_operation_id,
              [
                %{resource_id: "a", operation_id: ^operation_id_a},
                %{resource_id: "c", operation_id: ^operation_id_c}
              ], [%{resource_id: "b", reason: :foo}]} =
               OperationsHelper.reduce_bulk_operation_request(["a", "b", "c"], fn
                 "a" -> {:ok, operation_id_a}
                 "b" -> {:error, :foo}
                 "c" -> {:ok, operation_id_c}
               end)
    end

    test "should return an error when all the requests fail" do
      assert {:error, :bulk_operation_request_failed} ==
               OperationsHelper.reduce_bulk_operation_request(["a", "b"], fn
                 "a" -> {:error, :foo}
                 "b" -> {:error, :bar}
               end)
    end
  end

  describe "to_bulk_operation" do
    test "should convert an operation to its bulk operation" do
      assert :bulk_maintenance == OperationsHelper.to_bulk_operation(:maintenance)
    end

    test "should convert a list of operations to their bulk operations" do
      assert [:bulk_maintenance, :bulk_cluster_resource_refresh] ==
               OperationsHelper.to_bulk_operation([:maintenance, :cluster_resource_refresh])
    end
  end
end
