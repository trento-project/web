defmodule Trento.Integration.Checks.Wanda.Messaging.AMQP.ConsumerTest do
  use ExUnit.Case

  import Mox

  alias Trento.Messaging.Adapters.AMQP.Publisher

  setup [:set_mox_from_context, :verify_on_exit!]

  @moduletag :integration

  describe "handle_message/1" do
    test "should consume any incoming message" do
      pid = self()
      message = Faker.StarWars.quote()

      expect(GenRMQ.Processor.Mock, :process, fn %{payload: payload} ->
        assert ^message = payload
        send(pid, :consumed)
        :ok
      end)

      assert :ok = Publisher.publish_message(message, "results")

      assert_receive :consumed, 1_000
    end
  end

  describe "handle_error/1" do
    test "should reject unknown events and move them to the dead letter queue" do
      pid = self()

      expect(GenRMQ.Processor.Mock, :process, fn _ ->
        send(pid, :consumed)
        {:error, "invalid payload"}
      end)

      config =
        Application.fetch_env!(:trento, Trento.Integration.Checks.Wanda.Messaging.AMQP)[:consumer]

      connection = Keyword.get(config, :connection)
      routing_key = Keyword.get(config, :routing_key)
      deadletter_queue = Keyword.get(config, :queue) <> "_error"

      assert :ok = Publisher.publish_message("bad_payload", routing_key)

      {:ok, conn} = AMQP.Connection.open(connection)
      {:ok, chan} = AMQP.Channel.open(conn)
      {:ok, _consumer_tag} = AMQP.Basic.consume(chan, deadletter_queue)

      assert_receive {:basic_deliver, "bad_payload", _}

      :ok = AMQP.Channel.close(chan)

      assert_receive :consumed, 1_000
    end
  end
end
