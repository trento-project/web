defmodule Trento.Support.CommandedUtilsTest do
  use ExUnit.Case
  import Mox
  alias Trento.ActivityLog.Correlations
  alias Trento.Support.CommandedUtils

  setup :verify_on_exit!

  describe "maybe_correlated_dispatch/2" do
    test "should perform uncorrelated dispatch when called with arity 1" do
      uuid = Faker.UUID.v4()
      some_command = %{uuid: uuid}

      expect(
        Trento.Commanded.Mock,
        :dispatch,
        fn ^some_command ->
          :ok
        end
      )

      assert :ok == CommandedUtils.maybe_correlated_dispatch(some_command)
    end

    for ctx <- [:api_key, :suse_manager_settings] do
      @ctx ctx
      test "should perform uncorrelated dispatch when called with #{@ctx} ctx parameter but not setup anything on the correlation cache" do
        uuid = Faker.UUID.v4()
        some_command = %{uuid: uuid}

        expect(
          Trento.Commanded.Mock,
          :dispatch,
          fn ^some_command ->
            :ok
          end
        )

        assert :ok == CommandedUtils.maybe_correlated_dispatch(some_command, @ctx)
      end

      test "should perform correlated dispatch when called with #{@ctx} ctx parameter with kv setup on correlation cache" do
        uuid = Faker.UUID.v4()
        some_command = %{uuid: uuid}

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

        assert :ok == CommandedUtils.maybe_correlated_dispatch(some_command, @ctx)
      end
    end
  end

  describe "correlated_dispatch/1" do
    test "should perform correlated dispatch when correlation_id is setup in process dictionary" do
      uuid = Faker.UUID.v4()
      some_command = %{uuid: uuid}

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
