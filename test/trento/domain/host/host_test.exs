defmodule Trento.HostTest do
  use Trento.AggregateCase, aggregate: Trento.Domain.Host, async: true

  import Trento.Factory

  alias Trento.Domain.Commands.{
    DeregisterHost,
    RegisterHost,
    RequestHostDeregistration,
    RollUpHost,
    UpdateHeartbeat,
    UpdateProvider,
    UpdateSlesSubscriptions
  }

  alias Trento.Domain.Events.{
    HeartbeatFailed,
    HeartbeatSucceded,
    HostDeregistered,
    HostDeregistrationRequested,
    HostDetailsUpdated,
    HostRegistered,
    HostRolledUp,
    HostRollUpRequested,
    ProviderUpdated,
    SlesSubscriptionsUpdated
  }

  alias Trento.Domain.{
    AwsProvider,
    AzureProvider,
    GcpProvider
  }

  alias Trento.Domain.Host
  alias Trento.Domain.SlesSubscription

  describe "host registration" do
    test "should register a host" do
      host_id = Faker.UUID.v4()
      hostname = Faker.StarWars.character()
      ip_addresses = [Faker.Internet.ip_v4_address()]
      agent_version = Faker.Internet.slug()
      cpu_count = Enum.random(1..16)
      total_memory_mb = Enum.random(1..128)
      socket_count = Enum.random(1..16)
      os_version = Faker.App.version()
      installation_source = Enum.random([:community, :suse, :unknown])

      assert_events_and_state(
        [],
        RegisterHost.new!(%{
          host_id: host_id,
          hostname: hostname,
          ip_addresses: ip_addresses,
          agent_version: agent_version,
          cpu_count: cpu_count,
          total_memory_mb: total_memory_mb,
          socket_count: socket_count,
          os_version: os_version,
          installation_source: installation_source
        }),
        %HostRegistered{
          host_id: host_id,
          hostname: hostname,
          ip_addresses: ip_addresses,
          agent_version: agent_version,
          cpu_count: cpu_count,
          total_memory_mb: total_memory_mb,
          socket_count: socket_count,
          os_version: os_version,
          installation_source: installation_source,
          heartbeat: :unknown
        },
        %Host{
          host_id: host_id,
          hostname: hostname,
          ip_addresses: ip_addresses,
          agent_version: agent_version,
          cpu_count: cpu_count,
          total_memory_mb: total_memory_mb,
          socket_count: socket_count,
          os_version: os_version,
          installation_source: installation_source,
          heartbeat: :unknown
        }
      )
    end

    test "should update host details if it is already registered" do
      host_id = Faker.UUID.v4()
      new_hostname = Faker.StarWars.character()
      new_ip_addresses = [Faker.Internet.ip_v4_address()]
      new_agent_version = Faker.Internet.slug()
      new_cpu_count = Enum.random(1..16)
      new_total_memory_mb = Enum.random(1..128)
      new_socket_count = Enum.random(1..16)
      new_os_version = Faker.App.version()
      new_installation_source = Enum.random([:community, :suse, :unknown])

      assert_events_and_state(
        build(:host_registered_event, host_id: host_id),
        RegisterHost.new!(%{
          host_id: host_id,
          hostname: new_hostname,
          ip_addresses: new_ip_addresses,
          agent_version: new_agent_version,
          cpu_count: new_cpu_count,
          total_memory_mb: new_total_memory_mb,
          socket_count: new_socket_count,
          os_version: new_os_version,
          installation_source: new_installation_source
        }),
        %HostDetailsUpdated{
          host_id: host_id,
          hostname: new_hostname,
          ip_addresses: new_ip_addresses,
          agent_version: new_agent_version,
          cpu_count: new_cpu_count,
          total_memory_mb: new_total_memory_mb,
          socket_count: new_socket_count,
          os_version: new_os_version,
          installation_source: new_installation_source
        },
        %Host{
          host_id: host_id,
          hostname: new_hostname,
          ip_addresses: new_ip_addresses,
          agent_version: new_agent_version,
          cpu_count: new_cpu_count,
          total_memory_mb: new_total_memory_mb,
          socket_count: new_socket_count,
          os_version: new_os_version,
          installation_source: new_installation_source,
          heartbeat: :unknown
        }
      )
    end

    test "should not update host details if the same details were already registered" do
      host_registered_event = build(:host_registered_event)

      assert_events(
        host_registered_event,
        RegisterHost.new!(%{
          host_id: host_registered_event.host_id,
          hostname: host_registered_event.hostname,
          ip_addresses: host_registered_event.ip_addresses,
          agent_version: host_registered_event.agent_version,
          cpu_count: host_registered_event.cpu_count,
          total_memory_mb: host_registered_event.total_memory_mb,
          socket_count: host_registered_event.socket_count,
          os_version: host_registered_event.os_version,
          installation_source: host_registered_event.installation_source
        }),
        []
      )
    end
  end

  describe "heartbeat" do
    test "should emit an HeartbeatSucceded event if the Host never received an heartbeat already" do
      host_id = Faker.UUID.v4()
      host_registered_event = build(:host_registered_event, host_id: host_id)

      assert_events_and_state(
        host_registered_event,
        UpdateHeartbeat.new!(%{
          host_id: host_id,
          heartbeat: :passing
        }),
        %HeartbeatSucceded{
          host_id: host_id
        },
        fn state ->
          assert %Host{
                   heartbeat: :passing
                 } = state
        end
      )
    end

    test "should emit an HeartbeatSucceded event if the Host is in a critical status" do
      host_id = Faker.UUID.v4()

      initial_events = [
        build(:host_registered_event, host_id: host_id),
        %HeartbeatFailed{
          host_id: host_id
        }
      ]

      assert_events_and_state(
        initial_events,
        UpdateHeartbeat.new!(%{
          host_id: host_id,
          heartbeat: :passing
        }),
        %HeartbeatSucceded{
          host_id: host_id
        },
        fn state ->
          assert %Host{
                   heartbeat: :passing
                 } = state
        end
      )
    end

    test "should not emit an HeartbeatSucceded event if the Host is in a passing status already" do
      host_id = Faker.UUID.v4()

      initial_events = [
        build(:host_registered_event, host_id: host_id),
        %HeartbeatSucceded{
          host_id: host_id
        }
      ]

      assert_events(
        initial_events,
        UpdateHeartbeat.new!(%{
          host_id: host_id,
          heartbeat: :passing
        }),
        []
      )
    end

    test "should emit an HeartbeatFailed event if the Host has never received an heartbeat" do
      host_id = Faker.UUID.v4()

      initial_events = [
        build(:host_registered_event, host_id: host_id),
        %HeartbeatSucceded{
          host_id: host_id
        }
      ]

      assert_events_and_state(
        initial_events,
        UpdateHeartbeat.new!(%{
          host_id: host_id,
          heartbeat: :critical
        }),
        %HeartbeatFailed{
          host_id: host_id
        },
        fn state ->
          assert %Host{
                   heartbeat: :critical
                 } = state
        end
      )
    end

    test "should emit an HeartbeatFailed event if the Host is in a passing status" do
      host_id = Faker.UUID.v4()
      host_registered_event = build(:host_registered_event, host_id: host_id)

      assert_events_and_state(
        host_registered_event,
        UpdateHeartbeat.new!(%{
          host_id: host_id,
          heartbeat: :critical
        }),
        %HeartbeatFailed{
          host_id: host_id
        },
        fn state ->
          assert %Host{
                   heartbeat: :critical
                 } = state
        end
      )
    end

    test "should not emit an HeartbeatFailed event if the Host is in a critical status already" do
      host_id = Faker.UUID.v4()

      initial_events = [
        build(:host_registered_event, host_id: host_id),
        %HeartbeatFailed{
          host_id: host_id
        }
      ]

      assert_events(
        initial_events,
        UpdateHeartbeat.new!(%{
          host_id: host_id,
          heartbeat: :critical
        }),
        []
      )
    end
  end

  describe "provider" do
    test "should return an error if the host is not registered" do
      host_id = Faker.UUID.v4()

      assert_error(
        UpdateProvider.new!(%{
          host_id: host_id,
          provider: :azure
        }),
        {:error, :host_not_registered}
      )
    end

    test "should update azure provider" do
      host_id = Faker.UUID.v4()

      initial_events = [
        build(:host_registered_event, host_id: host_id)
      ]

      assert_events_and_state(
        initial_events,
        UpdateProvider.new!(%{
          host_id: host_id,
          provider: :azure,
          provider_data: %{
            vm_name: "vmhdbdev01",
            data_disk_number: 7,
            location: "westeurope",
            offer: "sles-sap-15-sp3-byos",
            resource_group: "/subscriptions/00000000-0000-0000-0000-000000000000",
            sku: "gen2",
            vm_size: "Standard_E4s_v3",
            admin_username: "cloudadmin"
          }
        }),
        %ProviderUpdated{
          host_id: host_id,
          provider: :azure,
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
        },
        fn state ->
          assert %Host{
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
                 } = state
        end
      )
    end

    test "should update aws provider" do
      host_id = Faker.UUID.v4()

      initial_events = [
        build(:host_registered_event, host_id: host_id)
      ]

      assert_events_and_state(
        initial_events,
        UpdateProvider.new!(%{
          host_id: host_id,
          provider: :azure,
          provider_data: %{
            account_id: "12345",
            ami_id: "ami-12345",
            availability_zone: "eu-west-1a",
            data_disk_number: 1,
            instance_id: "i-12345",
            instance_type: "t3.micro",
            region: "eu-west-1",
            vpc_id: "vpc-12345"
          }
        }),
        %ProviderUpdated{
          host_id: host_id,
          provider: :azure,
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
        },
        fn state ->
          assert %Host{
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
                 } = state
        end
      )
    end

    test "should update gcp provider" do
      host_id = Faker.UUID.v4()

      initial_events = [
        build(:host_registered_event, host_id: host_id)
      ]

      assert_events_and_state(
        initial_events,
        UpdateProvider.new!(%{
          host_id: host_id,
          provider: :azure,
          provider_data: %{
            disk_number: 4,
            image: "sles-15-sp1-sap-byos-v20220126",
            instance_name: "vmhana01",
            machine_type: "n1-highmem-8",
            network: "network",
            project_id: "123456",
            zone: "europe-west1-b"
          }
        }),
        %ProviderUpdated{
          host_id: host_id,
          provider: :azure,
          provider_data: %GcpProvider{
            disk_number: 4,
            image: "sles-15-sp1-sap-byos-v20220126",
            instance_name: "vmhana01",
            machine_type: "n1-highmem-8",
            network: "network",
            project_id: "123456",
            zone: "europe-west1-b"
          }
        },
        fn state ->
          assert %Host{
                   provider_data: %GcpProvider{
                     disk_number: 4,
                     image: "sles-15-sp1-sap-byos-v20220126",
                     instance_name: "vmhana01",
                     machine_type: "n1-highmem-8",
                     network: "network",
                     project_id: "123456",
                     zone: "europe-west1-b"
                   }
                 } = state
        end
      )
    end

    test "should not update provider if the same provider is registered" do
      host_id = Faker.UUID.v4()

      initial_events = [
        build(:host_registered_event, host_id: host_id),
        %ProviderUpdated{host_id: host_id, provider: :azure}
      ]

      assert_events(
        initial_events,
        UpdateProvider.new!(%{
          host_id: host_id,
          provider: :azure
        }),
        []
      )
    end
  end

  describe "sles subscriptions" do
    test "should update" do
      host_id = Faker.UUID.v4()
      identifier = Faker.StarWars.planet()
      version = Faker.StarWars.character()

      host_registered_event = build(:host_registered_event, host_id: host_id)

      subscription_data = %{
        host_id: host_id,
        identifier: identifier,
        version: version,
        arch: "x86_64",
        status: "active"
      }

      assert_events_and_state(
        host_registered_event,
        UpdateSlesSubscriptions.new!(%{
          host_id: host_id,
          subscriptions: [subscription_data]
        }),
        %SlesSubscriptionsUpdated{
          host_id: host_id,
          subscriptions: [SlesSubscription.new!(subscription_data)]
        },
        fn state ->
          assert %Host{
                   subscriptions: [
                     %SlesSubscription{
                       host_id: ^host_id,
                       identifier: ^identifier,
                       version: ^version,
                       arch: "x86_64",
                       status: "active"
                     }
                   ]
                 } = state
        end
      )
    end
  end

  describe "rollup" do
    test "should not accept a rollup command if a host was not registered yet" do
      assert_error(
        RollUpHost.new!(%{host_id: Faker.UUID.v4()}),
        {:error, :host_not_registered}
      )
    end

    test "should change the host state to rolling up" do
      host_id = UUID.uuid4()
      host_registered_event = build(:host_registered_event, host_id: host_id)

      assert_events_and_state(
        host_registered_event,
        RollUpHost.new!(%{host_id: host_id}),
        %HostRollUpRequested{
          host_id: host_id,
          snapshot: %Host{
            host_id: host_registered_event.host_id,
            hostname: host_registered_event.hostname,
            ip_addresses: host_registered_event.ip_addresses,
            agent_version: host_registered_event.agent_version,
            cpu_count: host_registered_event.cpu_count,
            total_memory_mb: host_registered_event.total_memory_mb,
            socket_count: host_registered_event.socket_count,
            os_version: host_registered_event.os_version,
            installation_source: host_registered_event.installation_source,
            heartbeat: :unknown,
            rolling_up: false
          }
        },
        fn %Host{rolling_up: rolling_up} ->
          assert rolling_up
        end
      )
    end

    test "should not accept commands if a host is in rolling up state" do
      host_id = UUID.uuid4()
      host_registered_event = build(:host_registered_event, host_id: host_id)

      events = [
        host_registered_event,
        %HostRollUpRequested{
          host_id: host_id,
          snapshot: %Host{}
        }
      ]

      assert_error(
        events,
        UpdateProvider.new!(%{
          host_id: host_id,
          provider: :azure,
          provider_data: %{
            account_id: "12345",
            ami_id: "ami-12345",
            availability_zone: "eu-west-1a",
            data_disk_number: 1,
            instance_id: "i-12345",
            instance_type: "t3.micro",
            region: "eu-west-1",
            vpc_id: "vpc-12345"
          }
        }),
        {:error, :host_rolling_up}
      )

      assert_error(
        events,
        RollUpHost.new!(%{
          host_id: host_id
        }),
        {:error, :host_rolling_up}
      )
    end

    test "should apply the rollup event and rehydrate the aggregate" do
      host_id = UUID.uuid4()
      host_registered_event = build(:host_registered_event, host_id: host_id)

      assert_state(
        [
          host_registered_event,
          %HostRolledUp{
            host_id: host_id,
            snapshot: %Host{
              host_id: host_registered_event.host_id,
              hostname: host_registered_event.hostname,
              ip_addresses: host_registered_event.ip_addresses,
              agent_version: host_registered_event.agent_version,
              cpu_count: host_registered_event.cpu_count,
              total_memory_mb: host_registered_event.total_memory_mb,
              socket_count: host_registered_event.socket_count,
              os_version: host_registered_event.os_version,
              installation_source: host_registered_event.installation_source,
              heartbeat: :unknown,
              rolling_up: false
            }
          }
        ],
        [],
        fn host ->
          refute host.rolling_up
          assert host.host_id == host_registered_event.host_id
          assert host.hostname == host_registered_event.hostname
          assert host.ip_addresses == host_registered_event.ip_addresses
          assert host.agent_version == host_registered_event.agent_version
          assert host.cpu_count == host_registered_event.cpu_count
          assert host.total_memory_mb == host_registered_event.total_memory_mb
          assert host.socket_count == host_registered_event.socket_count
          assert host.os_version == host_registered_event.os_version
          assert host.installation_source == host_registered_event.installation_source
          assert host.heartbeat == :unknown
        end
      )
    end
  end

  describe "deregistration" do
    test "should emit the HostDeregistered event" do
      host_id = Faker.UUID.v4()
      dat = DateTime.utc_now()

      host_registered_event = build(:host_registered_event, host_id: host_id)

      assert_events(
        [host_registered_event],
        [
          %DeregisterHost{
            host_id: host_id,
            deregistered_at: dat
          }
        ],
        %HostDeregistered{
          host_id: host_id,
          deregistered_at: dat
        }
      )
    end

    test "should emit the HostDeregistrationRequest Event" do
      host_id = Faker.UUID.v4()
      requested_at = DateTime.utc_now()

      host_registered_event = build(:host_registered_event, host_id: host_id)

      assert_events(
        [host_registered_event],
        [
          %RequestHostDeregistration{
            host_id: host_id,
            requested_at: requested_at
          }
        ],
        %HostDeregistrationRequested{
          host_id: host_id,
          requested_at: requested_at
        }
      )
    end

    test "should apply the HostDeregistered command and set the deregistration date into the state" do
      host_id = Faker.UUID.v4()
      dat = DateTime.utc_now()

      host_registered_event = build(:host_registered_event, host_id: host_id)

      assert_state(
        [
          host_registered_event,
          %HostDeregistered{
            host_id: host_id,
            deregistered_at: dat
          }
        ],
        [],
        fn host ->
          assert dat == host.deregistered_at
        end
      )
    end
  end
end
