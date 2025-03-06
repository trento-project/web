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
end
