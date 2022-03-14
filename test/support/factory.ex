defmodule Tronto.Factory do
  @moduledoc """
  A simple Factory helper module to be used within tests to generate test data
  """

  alias Tronto.Repo

  alias Tronto.Monitoring.Domain.SlesSubscription

  alias Tronto.Monitoring.Domain.Events.{
    ApplicationInstanceRegistered,
    ClusterRegistered,
    DatabaseInstanceRegistered,
    DatabaseRegistered,
    HostAddedToCluster,
    HostRegistered,
    SapSystemRegistered,
    SlesSubscriptionsUpdated
  }

  alias Tronto.Monitoring.{
    ApplicationInstanceReadModel,
    ClusterReadModel,
    DatabaseInstanceReadModel,
    DatabaseReadModel,
    HostReadModel,
    SapSystemReadModel,
    SlesSubscriptionReadModel
  }

  def host_registered_event(attrs \\ []) do
    %HostRegistered{
      host_id: Keyword.get(attrs, :host_id, Faker.UUID.v4()),
      hostname: Keyword.get(attrs, :hostname, Faker.StarWars.character()),
      ip_addresses: Keyword.get(attrs, :ip_addresses, [Faker.Internet.ip_v4_address()]),
      agent_version: Keyword.get(attrs, :agent_version, Faker.App.semver()),
      heartbeat: :unknown
    }
  end

  def host_projection(attrs \\ []) do
    cluster_projection = Keyword.get(attrs, :cluster, cluster_projection())

    cluster_id =
      if cluster_projection do
        cluster_projection.id
      else
        nil
      end

    Repo.insert!(%HostReadModel{
      id: Keyword.get(attrs, :id, Faker.UUID.v4()),
      hostname: Keyword.get(attrs, :hostname, Faker.StarWars.character()),
      ip_addresses: [Faker.Internet.ip_v4_address()],
      agent_version: Faker.StarWars.planet(),
      cluster_id: cluster_id,
      cluster: cluster_projection,
      heartbeat: :unknown
    })
  end

  def cluster_registered_event(attrs \\ []) do
    %ClusterRegistered{
      cluster_id: Keyword.get(attrs, :cluster_id, Faker.UUID.v4()),
      name: Keyword.get(attrs, :name, Faker.StarWars.character()),
      sid: Keyword.get(attrs, :sid, Faker.StarWars.planet()),
      type: Keyword.get(attrs, :type, :hana_scale_up)
    }
  end

  def host_added_to_cluster_event(attrs \\ []) do
    %HostAddedToCluster{
      cluster_id: Keyword.get(attrs, :cluster_id, Faker.UUID.v4()),
      host_id: Keyword.get(attrs, :host_id, Faker.UUID.v4())
    }
  end

  def subscription_projection(attrs \\ []) do
    host_projection = host_projection(id: Keyword.get(attrs, :host_id, Faker.UUID.v4()))

    Repo.insert!(%SlesSubscriptionReadModel{
      host_id: host_projection.id,
      identifier: Keyword.get(attrs, :identifier, Faker.Airports.iata()),
      version: Keyword.get(attrs, :version, Faker.App.semver())
    })
  end

  def cluster_projection(attrs \\ []) do
    Repo.insert!(%ClusterReadModel{
      id: Keyword.get(attrs, :id, Faker.UUID.v4()),
      name: Keyword.get(attrs, :name, Faker.StarWars.character()),
      sid: Keyword.get(attrs, :sid, Faker.StarWars.planet()),
      type: Keyword.get(attrs, :type, :hana_scale_up),
      health: Keyword.get(attrs, :health, :passing)
    })
  end

  def subscriptions_updated_event(attrs \\ []) do
    host_id = Keyword.get(attrs, :host_id, Faker.UUID.v4())

    %SlesSubscriptionsUpdated{
      host_id: host_id,
      subscriptions: [
        %SlesSubscription{
          host_id: host_id,
          identifier: Faker.StarWars.planet(),
          version: Faker.StarWars.character(),
          arch: "x86_64",
          status: "active"
        }
      ]
    }
  end

  def database_instance_registered_event(attrs \\ []) do
    %DatabaseInstanceRegistered{
      sap_system_id: Keyword.get(attrs, :sap_system_id, Faker.UUID.v4()),
      sid: Keyword.get(attrs, :sid, Faker.UUID.v4()),
      tenant: Keyword.get(attrs, :tenant, Faker.UUID.v4()),
      instance_number: Keyword.get(attrs, :instance_number, "00"),
      features: Faker.Pokemon.name(),
      host_id: Keyword.get(attrs, :host_id, Faker.UUID.v4()),
      health: Keyword.get(attrs, :health, :passing)
    }
  end

  def application_instance_registered_event(attrs \\ []) do
    %ApplicationInstanceRegistered{
      sap_system_id: Keyword.get(attrs, :sap_system_id, Faker.UUID.v4()),
      sid: Keyword.get(attrs, :sid, Faker.UUID.v4()),
      instance_number: Keyword.get(attrs, :instance_number, "00"),
      features: Faker.Pokemon.name(),
      host_id: Keyword.get(attrs, :host_id, Faker.UUID.v4()),
      health: Keyword.get(attrs, :health, :passing)
    }
  end

  def database_registered_event(attrs \\ []) do
    %DatabaseRegistered{
      sap_system_id: Keyword.get(attrs, :sap_system_id, Faker.UUID.v4()),
      sid: Keyword.get(attrs, :sid, Faker.UUID.v4()),
      health: Keyword.get(attrs, :health, :passing)
    }
  end

  def sap_system_registered_event(attrs \\ []) do
    %SapSystemRegistered{
      sap_system_id: Keyword.get(attrs, :sap_system_id, Faker.UUID.v4()),
      sid: Keyword.get(attrs, :sid, Faker.UUID.v4()),
      db_host: Faker.Internet.ip_v4_address(),
      tenant: Faker.Beer.hop(),
      health: Keyword.get(attrs, :health, :passing)
    }
  end

  def database_projection(attrs \\ []) do
    Repo.insert!(%DatabaseReadModel{
      id: Keyword.get(attrs, :id, Faker.UUID.v4()),
      sid: Keyword.get(attrs, :sid, Faker.StarWars.planet())
    })
  end

  def sap_system_projection(attrs \\ []) do
    Repo.insert!(%SapSystemReadModel{
      id: Keyword.get(attrs, :id, Faker.UUID.v4()),
      sid: Keyword.get(attrs, :sid, Faker.StarWars.planet()),
      tenant: Keyword.get(attrs, :sid, Faker.Beer.hop()),
      db_host: Keyword.get(attrs, :sid, Faker.Internet.ip_v4_address())
    })
  end

  def database_instance_projection(attrs \\ []) do
    host_projection = host_projection()

    Repo.insert!(%DatabaseInstanceReadModel{
      sap_system_id: Keyword.get(attrs, :sap_system_id, Faker.UUID.v4()),
      sid: Keyword.get(attrs, :sid, Faker.UUID.v4()),
      tenant: Keyword.get(attrs, :tenant, Faker.UUID.v4()),
      instance_number: Keyword.get(attrs, :instance_number, "00"),
      features: Keyword.get(attrs, :features, Faker.Pokemon.name()),
      host_id: host_projection.id,
      host: host_projection
    })
  end

  def application_instance_projection(attrs \\ []) do
    host_projection = host_projection()

    Repo.insert!(%ApplicationInstanceReadModel{
      sap_system_id: Keyword.get(attrs, :sap_system_id, Faker.UUID.v4()),
      sid: Keyword.get(attrs, :sid, Faker.UUID.v4()),
      instance_number: Keyword.get(attrs, :instance_number, "00"),
      features: Keyword.get(attrs, :features, Faker.Pokemon.name()),
      host_id: host_projection.id,
      host: host_projection
    })
  end
end
