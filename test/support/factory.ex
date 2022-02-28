defmodule Tronto.Factory do
  @moduledoc """
  A simple Factory helper module to be used within tests to generate test data
  """

  alias Tronto.Repo

  alias Tronto.Monitoring.Domain.Events.{
    ClusterRegistered,
    HostRegistered
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
    host_projection = %HostReadModel{
      id: Keyword.get(attrs, :id, Faker.UUID.v4()),
      hostname: Faker.StarWars.character(),
      ip_addresses: [Faker.Internet.ip_v4_address()],
      agent_version: Faker.StarWars.planet(),
      heartbeat: :unknown
    }

    Repo.insert!(host_projection)

    host_projection
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
    cluster_projection = %ClusterReadModel{
      id: Keyword.get(attrs, :id, Faker.UUID.v4()),
      name: Keyword.get(attrs, :name, Faker.StarWars.character()),
      sid: Keyword.get(attrs, :sid, Faker.StarWars.planet()),
      type: Keyword.get(attrs, :type, :hana_scale_up),
      health:  Keyword.get(attrs, :health, :passing)
    }

    Repo.insert!(cluster_projection)

    cluster_projection
  end
end
