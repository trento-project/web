defmodule Tronto.Factory do
  @moduledoc """
  A simple Factory helper module to be used within tests to generate test data
  """

  alias Tronto.Repo

  alias Tronto.Monitoring.Domain.Events.{
    ClusterRegistered,
    HostRegistered,
    SlesSubscriptionsUpdated
  }

  alias Tronto.Monitoring.{
    ClusterReadModel,
    HostReadModel
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
    Repo.insert!(%HostReadModel{
      id: Keyword.get(attrs, :id, Faker.UUID.v4()),
      hostname: Faker.StarWars.character(),
      ip_addresses: [Faker.Internet.ip_v4_address()],
      agent_version: Faker.StarWars.planet(),
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
        %{
          host_id: host_id,
          identifier: Faker.StarWars.planet(),
          version: Faker.StarWars.character(),
          arch: "x86_64",
          status: "active"
        }
      ]
    }
  end
end
