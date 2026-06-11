# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Support.CommandedUtilsTest do
  use ExUnit.Case
  import Mox
  alias Trento.ActivityLog.Correlations
  alias Trento.Support.CommandedUtils

  setup :verify_on_exit!

  describe "dispatch/2" do
    test "should dispatch a single command" do
      some_command = %{uuid: Faker.UUID.v4()}

      expect(
        Trento.Commanded.Mock,
        :dispatch,
        fn ^some_command, [opt: 1] ->
          :ok
        end
      )

      assert :ok == CommandedUtils.dispatch(some_command, opt: 1)
    end

    test "should dispatch multiple commands successfully" do
      some_commands = [
        command1 = %{uuid: Faker.UUID.v4()},
        command2 = %{uuid: Faker.UUID.v4()}
      ]

      expect(
        Trento.Commanded.Mock,
        :dispatch,
        2,
        fn
          ^command1, [] -> :ok
          ^command2, [] -> :ok
        end
      )

      assert :ok == CommandedUtils.dispatch(some_commands)
    end

    test "should dispatch multiple commands with errors" do
      some_commands = [
        command1 = %{uuid: Faker.UUID.v4()},
        command2 = %{uuid: Faker.UUID.v4()},
        command3 = %{uuid: Faker.UUID.v4()},
        command4 = %{uuid: Faker.UUID.v4()}
      ]

      expect(
        Trento.Commanded.Mock,
        :dispatch,
        4,
        fn
          ^command1, [] -> :ok
          ^command2, [] -> {:error, :error1}
          ^command3, [] -> :ok
          ^command4, [] -> {:error, :error2}
        end
      )

      assert {:error, [:error2, :error1]} == CommandedUtils.dispatch(some_commands)
    end
  end

  describe "correlated_dispatch/2" do
    for ctx <- [:api_key, :suse_manager_settings] do
      @ctx ctx
      test "should perform uncorrelated dispatch when called with #{@ctx} ctx parameter but not setup anything on the correlation cache" do
        some_command = %{uuid: Faker.UUID.v4()}

        expect(
          Trento.Commanded.Mock,
          :dispatch,
          fn ^some_command ->
            :ok
          end
        )

        assert :ok == CommandedUtils.correlated_dispatch(some_command, @ctx)
      end

      test "should perform correlated dispatch when called with #{@ctx} ctx parameter with kv setup on correlation cache" do
        some_command = %{uuid: Faker.UUID.v4()}

        key0 = UUID.uuid4()
        correlation_id = UUID.uuid4()
        _ = Process.put(:correlation_key, key0)

        key = Correlations.correlation_key(@ctx)
        assert key0 == key
        :ok = Correlations.put_correlation_id(key, correlation_id)

        expect(
          Trento.Commanded.Mock,
          :dispatch,
          fn ^some_command, [correlation_id: ^correlation_id, causation_id: ^correlation_id] ->
            :ok
          end
        )

        assert :ok == CommandedUtils.correlated_dispatch(some_command, @ctx)
      end
    end
  end

  describe "correlated_dispatch/1" do
    test "should perform correlated dispatch when correlation_id is setup in process dictionary" do
      some_command = %{uuid: Faker.UUID.v4()}

      correlation_id = UUID.uuid4()
      _ = Process.put(:correlation_id, correlation_id)

      expect(
        Trento.Commanded.Mock,
        :dispatch,
        fn ^some_command, [correlation_id: ^correlation_id, causation_id: ^correlation_id] ->
          :ok
        end
      )

      assert :ok == CommandedUtils.correlated_dispatch(some_command)
    end
  end
end
