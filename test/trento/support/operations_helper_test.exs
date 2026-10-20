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

      assert {:ok, _bulk_operation_id, operations} =
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
      assert {:ok, _bulk_operation_id, []} =
               OperationsHelper.reduce_bulk_operation_request([], fn _ ->
                 flunk("request function should not be called")
               end)
    end

    test "should halt on the first error and return it" do
      assert {:error, :foo} ==
               OperationsHelper.reduce_bulk_operation_request(["a", "b", "c"], fn resource_id ->
                 case resource_id do
                   "a" -> {:ok, UUID.uuid4()}
                   "b" -> {:error, :foo}
                   "c" -> flunk("operation for c should not be requested")
                 end
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
