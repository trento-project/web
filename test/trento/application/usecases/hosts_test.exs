defmodule Trento.HostsTest do
  use ExUnit.Case
  use Trento.DataCase

  import Mox

  import Trento.Factory

  alias Trento.Hosts
  alias Trento.Repo

  alias Trento.Domain.Commands.SelectHostChecks

  alias Trento.SlesSubscriptionReadModel

  @moduletag :integration

  describe "SLES Subscriptions" do
    test "No SLES4SAP Subscriptions detected" do
      assert 0 = SlesSubscriptionReadModel |> Repo.all() |> length()
      assert 0 = Hosts.get_all_sles_subscriptions()
    end

    test "Detects the correct number of SLES4SAP Subscriptions" do
      insert_list(6, :sles_subscription, identifier: "SLES_SAP")
      insert_list(6, :sles_subscription, identifier: "sle-module-server-applications")

      assert 12 = SlesSubscriptionReadModel |> Repo.all() |> length()
      assert 6 = Hosts.get_all_sles_subscriptions()
    end
  end

  describe "Check Selection" do
    test "should dispatch command on Check Selection" do
      host_id = Faker.UUID.v4()
      selected_checks = Enum.map(0..4, fn _ -> Faker.UUID.v4() end)

      expect(
        Trento.Commanded.Mock,
        :dispatch,
        fn %SelectHostChecks{
             host_id: ^host_id,
             checks: ^selected_checks
           } ->
          :ok
        end
      )

      assert :ok = Hosts.select_checks(host_id, selected_checks)
    end

    test "should return command dispatching error" do
      host_id = Faker.UUID.v4()
      selected_checks = Enum.map(0..4, fn _ -> Faker.UUID.v4() end)

      expect(
        Trento.Commanded.Mock,
        :dispatch,
        fn %SelectHostChecks{
             host_id: ^host_id,
             checks: ^selected_checks
           } ->
          {:error, :some_error}
        end
      )

      assert {:error, :some_error} = Hosts.select_checks(host_id, selected_checks)
    end
  end
end
