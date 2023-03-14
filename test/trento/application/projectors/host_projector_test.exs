defmodule Trento.HostProjectorTest do
  use ExUnit.Case
  use Trento.DataCase

  import Phoenix.ChannelTest
  import TrentoWeb.ChannelCase

  import Trento.Factory

  require Trento.Domain.Enums.Provider, as: Provider

  alias Trento.{
    HostProjector,
    HostReadModel
  }

  alias Trento.Domain.{
    AwsProvider,
    AzureProvider,
    GcpProvider
  }

  alias Trento.Domain.Events.{
    HeartbeatFailed,
    HeartbeatSucceded,
    HostAddedToCluster,
    HostDeregistered,
    HostDetailsUpdated,
    ProviderUpdated
  }

  alias Trento.ProjectorTestHelper
  alias Trento.Repo

  @moduletag :integration

  @endpoint TrentoWeb.Endpoint

  setup do
    {:ok, _, socket} =
      TrentoWeb.UserSocket
      |> socket("user_id", %{some: :assign})
      |> subscribe_and_join(TrentoWeb.MonitoringChannel, "monitoring:hosts")

    %{socket: socket}
  end

  setup do
    %HostReadModel{id: host_id, hostname: hostname} = insert(:host)

    %{host_id: host_id, hostname: hostname}
  end

  test "should project a new host when HostRegistered event is received" do
    event = build(:host_registered_event)

    ProjectorTestHelper.project(HostProjector, event, "host_projector")

    %{
      agent_version: agent_version,
      heartbeat: heartbeat,
      hostname: hostname,
      id: id,
      ip_addresses: ip_addresses,
      cluster_id: cluster_id,
      provider: provider,
      provider_data: provider_data
    } = host_projection = Repo.get!(HostReadModel, event.host_id)

    assert event.host_id == host_projection.id
    assert event.hostname == host_projection.hostname
    assert event.ip_addresses == host_projection.ip_addresses
    assert event.agent_version == host_projection.agent_version
    assert event.heartbeat == host_projection.heartbeat

    assert_broadcast "host_registered",
                     %{
                       agent_version: ^agent_version,
                       cluster_id: ^cluster_id,
                       heartbeat: ^heartbeat,
                       hostname: ^hostname,
                       id: ^id,
                       ip_addresses: ^ip_addresses,
                       provider: ^provider,
                       provider_data: ^provider_data
                     },
                     1000
  end

  test "should update the cluster_id field when HostAddedToCluster event is received and the host was already registered" do
    insert(
      :host,
      id: host_id = UUID.uuid4(),
      hostname: hostname = Faker.StarWars.character(),
      cluster_id: nil
    )

    insert(:cluster, id: cluster_id = Faker.UUID.v4())

    event = %HostAddedToCluster{
      host_id: host_id,
      cluster_id: cluster_id
    }

    ProjectorTestHelper.project(HostProjector, event, "host_projector")
    host_projection = Repo.get!(HostReadModel, event.host_id)

    assert event.cluster_id == host_projection.cluster_id
    assert hostname == host_projection.hostname

    assert_broadcast "host_details_updated", %{id: ^host_id, cluster_id: ^cluster_id}, 1000
  end

  test "should project a new host with no additional properties when HostAddedToCluster event is received" do
    insert(:cluster, id: cluster_id = Faker.UUID.v4())

    %{host_id: host_id} =
      event = %HostAddedToCluster{
        host_id: Faker.UUID.v4(),
        cluster_id: cluster_id
      }

    ProjectorTestHelper.project(HostProjector, event, "host_projector")
    host_projection = Repo.get!(HostReadModel, event.host_id)

    assert event.cluster_id == host_projection.cluster_id
    assert nil == host_projection.hostname

    refute_broadcast "host_details_updated", %{id: ^host_id, cluster_id: ^cluster_id}, 1000
  end

  test "should update an existing host when HostDetailsUpdated event is received", %{
    host_id: host_id
  } do
    %{
      agent_version: agent_version,
      hostname: hostname,
      ip_addresses: ip_addresses
    } =
      event = %HostDetailsUpdated{
        host_id: host_id,
        hostname: Faker.StarWars.character(),
        ip_addresses: [Faker.Internet.ip_v4_address()],
        agent_version: Faker.StarWars.planet(),
        cpu_count: Enum.random(1..16),
        total_memory_mb: Enum.random(1..128),
        socket_count: Enum.random(1..16),
        os_version: Faker.App.version()
      }

    ProjectorTestHelper.project(HostProjector, event, "host_projector")
    host_projection = Repo.get!(HostReadModel, event.host_id)

    assert event.host_id == host_projection.id
    assert event.hostname == host_projection.hostname
    assert event.ip_addresses == host_projection.ip_addresses
    assert event.agent_version == host_projection.agent_version

    assert_broadcast "host_details_updated",
                     %{
                       agent_version: ^agent_version,
                       hostname: ^hostname,
                       id: ^host_id,
                       ip_addresses: ^ip_addresses,
                       provider_data: nil
                     },
                     1000
  end

  test "should update the heartbeat field to passing status when HeartbeatSucceded is received",
       %{host_id: host_id} do
    event = %HeartbeatSucceded{
      host_id: host_id
    }

    ProjectorTestHelper.project(HostProjector, event, "host_projector")
    %{hostname: hostname} = host_projection = Repo.get!(HostReadModel, event.host_id)

    assert :passing == host_projection.heartbeat

    assert_broadcast "heartbeat_succeded",
                     %{
                       id: ^host_id,
                       hostname: ^hostname
                     },
                     1000
  end

  test "should update the heartbeat field to critical status when HeartbeatFailed is received", %{
    host_id: host_id
  } do
    event = %HeartbeatFailed{
      host_id: host_id
    }

    ProjectorTestHelper.project(HostProjector, event, "host_projector")
    %{hostname: hostname} = host_projection = Repo.get!(HostReadModel, event.host_id)

    assert :critical == host_projection.heartbeat

    assert_broadcast "heartbeat_failed",
                     %{
                       id: ^host_id,
                       hostname: ^hostname
                     },
                     1000
  end

  test "should update the provider field when ProviderUpdated is received with Azure provider type",
       %{
         host_id: host_id
       } do
    event = %ProviderUpdated{
      host_id: host_id,
      provider: Provider.azure(),
      provider_data: %AzureProvider{
        vm_name: "vmhdbdev01",
        data_disk_number: 7,
        location: "westeurope",
        offer: "sles-sap-15-sp3-byos",
        resource_group: "/subscriptions/00000000-0000-0000-0000-000000000000",
        sku: "gen2",
        vm_size: "Standard_E4s_v3",
        admin_username: "cloudadmin"
      }
    }

    ProjectorTestHelper.project(HostProjector, event, "host_projector")
    host_projection = Repo.get!(HostReadModel, event.host_id)

    expected_azure_model = %{
      "vm_name" => "vmhdbdev01",
      "data_disk_number" => 7,
      "location" => "westeurope",
      "offer" => "sles-sap-15-sp3-byos",
      "resource_group" => "/subscriptions/00000000-0000-0000-0000-000000000000",
      "sku" => "gen2",
      "vm_size" => "Standard_E4s_v3",
      "admin_username" => "cloudadmin"
    }

    assert :azure == host_projection.provider
    assert expected_azure_model == host_projection.provider_data

    broadcast_provider_data =
      Map.new(expected_azure_model, fn {k, v} -> {String.to_atom(k), v} end)

    assert_broadcast "host_details_updated",
                     %{
                       id: ^host_id,
                       provider: :azure,
                       provider_data: ^broadcast_provider_data
                     },
                     1000
  end

  test "should update the provider field when ProviderUpdated is received with AWS provider type",
       %{
         host_id: host_id
       } do
    event = %ProviderUpdated{
      host_id: host_id,
      provider: Provider.aws(),
      provider_data: %AwsProvider{
        account_id: "12345",
        ami_id: "ami-12345",
        availability_zone: "eu-west-1a",
        data_disk_number: 1,
        instance_id: "i-12345",
        instance_type: "t3.micro",
        region: "eu-west-1",
        vpc_id: "vpc-12345"
      }
    }

    ProjectorTestHelper.project(HostProjector, event, "host_projector")
    host_projection = Repo.get!(HostReadModel, event.host_id)

    expected_aws_model = %{
      "account_id" => "12345",
      "ami_id" => "ami-12345",
      "availability_zone" => "eu-west-1a",
      "data_disk_number" => 1,
      "instance_id" => "i-12345",
      "instance_type" => "t3.micro",
      "region" => "eu-west-1",
      "vpc_id" => "vpc-12345"
    }

    assert Provider.aws() == host_projection.provider
    assert expected_aws_model == host_projection.provider_data

    broadcast_provider_data = Map.new(expected_aws_model, fn {k, v} -> {String.to_atom(k), v} end)

    assert_broadcast "host_details_updated",
                     %{
                       id: ^host_id,
                       provider: :aws,
                       provider_data: ^broadcast_provider_data
                     },
                     1000
  end

  test "should update the provider field when ProviderUpdated is received with GCP provider type",
       %{
         host_id: host_id
       } do
    event = %ProviderUpdated{
      host_id: host_id,
      provider: Provider.gcp(),
      provider_data: %GcpProvider{
        disk_number: 4,
        image: "sles-15-sp1-sap-byos-v20220126",
        instance_name: "vmhana01",
        machine_type: "n1-highmem-8",
        network: "network",
        project_id: "123456",
        zone: "europe-west1-b"
      }
    }

    ProjectorTestHelper.project(HostProjector, event, "host_projector")
    host_projection = Repo.get!(HostReadModel, event.host_id)

    expected_gcp_model = %{
      "disk_number" => 4,
      "image" => "sles-15-sp1-sap-byos-v20220126",
      "instance_name" => "vmhana01",
      "machine_type" => "n1-highmem-8",
      "network" => "network",
      "project_id" => "123456",
      "zone" => "europe-west1-b"
    }

    assert :gcp == host_projection.provider
    assert expected_gcp_model == host_projection.provider_data

    broadcast_provider_data = Map.new(expected_gcp_model, fn {k, v} -> {String.to_atom(k), v} end)

    assert_broadcast "host_details_updated",
                     %{
                       id: ^host_id,
                       provider: :gcp,
                       provider_data: ^broadcast_provider_data
                     },
                     1000
  end

  test "should update the deregistered_at field when HostDeregistered is received",
       %{
         host_id: host_id,
         hostname: hostname
       } do
    timestamp = DateTime.utc_now()

    event = %HostDeregistered{
      host_id: host_id,
      deregistered_at: timestamp
    }

    ProjectorTestHelper.project(HostProjector, event, "host_projector")
    host_projection = Repo.get!(HostReadModel, host_id)

    assert timestamp == host_projection.deregistered_at

    assert_broadcast "host_deregistered",
                     %{
                       id: ^host_id,
                       hostname: ^hostname
                     },
                     1000
  end
end
