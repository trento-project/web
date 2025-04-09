defmodule Trento.Infrastructure.Catalog.AMQP.ProcessorTest do
  @moduledoc false
  use ExUnit.Case, async: true
  use Trento.DataCase, async: true

  alias GenRMQ.Message

  alias Trento.Checks.V1.{
    CheckCustomizationApplied,
    CheckCustomizationReset
  }

  alias Trento.Infrastructure.Catalog.AMQP.Processor

  alias Trento.ActivityLog.ActivityLog

  alias Trento.Contracts

  alias Trento.Repo

  import Trento.Factory

  defp assert_entry_has_been_logged(amount) do
    assert amount ==
             ActivityLog
             |> Repo.all()
             |> length()
  end

  describe "catalog amqp processor" do
    test "should return error if the event cannot be decoded" do
      message = Message.create(%{}, "bad-payload", nil)
      assert {:error, :decoding_error} = Processor.process(message)
      assert_entry_has_been_logged(0)
    end

    test "should process CheckCustomizationApplied" do
      check_id = UUID.uuid4()
      group_id = UUID.uuid4()
      target_type = Faker.Lorem.word()

      %{id: user_id} = insert(:user)

      check_customization_applied =
        Contracts.to_event(
          %CheckCustomizationApplied{
            check_id: check_id,
            group_id: group_id,
            target_type: target_type,
            custom_values: []
          },
          additional_attributes: %{"user_id" => {:ce_integer, user_id}}
        )

      assert :ok =
               %{}
               |> Message.create(check_customization_applied, nil)
               |> Processor.process()

      assert_entry_has_been_logged(1)
    end

    test "should process OperatCheckCustomizationReset" do
      check_id = UUID.uuid4()
      group_id = UUID.uuid4()
      target_type = Faker.Lorem.word()

      %{id: user_id} = insert(:user)

      check_customization_reset =
        Contracts.to_event(
          %CheckCustomizationReset{
            check_id: check_id,
            group_id: group_id,
            target_type: target_type
          },
          additional_attributes: %{"user_id" => {:ce_integer, user_id}}
        )

      assert :ok =
               %{}
               |> Message.create(check_customization_reset, nil)
               |> Processor.process()

      assert_entry_has_been_logged(1)
    end

    test "should gracefully handle missing user information" do
      check_customization_applied =
        :check_customization_applied_v1
        |> build()
        |> Contracts.to_event(additional_attributes: %{})

      assert :ok =
               %{}
               |> Message.create(check_customization_applied, nil)
               |> Processor.process()

      assert_entry_has_been_logged(1)
    end
  end
end
