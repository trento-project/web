# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule TrentoWeb.V1.HostJSONTest do
  @moduledoc false

  use TrentoWeb.ConnCase, async: true

  import Trento.Factory

  alias TrentoWeb.V1.HostJSON

  alias Trento.Hosts.Projections.HostReadModel

  test "should render health changed relevant information" do
    %HostReadModel{id: id, hostname: hostname} = host = build(:host, health: :passing)

    assert %{id: id, hostname: hostname, health: :passing} ==
             HostJSON.host_health_changed(%{host: host})
  end

  test "should render single host information" do
    host = build(:host, sles_subscriptions: build_list(1, :sles_subscription))

    rendered_host = HostJSON.host(%{host: host})

    refute Access.get(rendered_host, :fully_qualified_domain_name)
    refute Access.get(rendered_host, :prometheus_targets)
    refute Access.get(rendered_host, :inserted_at)
  end

  test "should render host details relevant information" do
    host = build(:host)

    rendered_map = HostJSON.host_details_updated(%{host: host})

    ignored_properties = [
      :sles_subscriptions,
      :tags,
      :cluster_id,
      :heartbeat,
      :health,
      :provider
    ]

    assert Enum.all?(ignored_properties, &(!Map.has_key?(rendered_map, &1)))
  end

  test "should handle gcp host metadata" do
    gcp_metadata = %{
      "disk_number" => 4,
      "image" => "sles-15-sp1-sap-byos-v20220126",
      "instance_name" => "vmhana01",
      "machine_type" => "n1-highmem-8",
      "network" => "network",
      "project_id" => "123456",
      "zone" => "europe-west1-b"
    }

    hosts = [
      build(:host,
        sles_subscriptions: build_list(1, :sles_subscription),
        provider: :gcp,
        provider_data: gcp_metadata
      ),
      build(:host,
        sles_subscriptions: build_list(1, :sles_subscription),
        provider: :gcp,
        provider_data: nil
      ),
      build(:host,
        sles_subscriptions: build_list(1, :sles_subscription),
        provider: :gcp,
        provider_data: Map.put(gcp_metadata, "image", nil)
      )
    ]

    assert [
             %{
               provider_data: %{
                 "image" => "sles-15-sp1-sap-byos-v20220126"
               }
             },
             %{
               provider_data: nil
             },
             %{
               provider_data: %{
                 "image" => nil
               }
             }
           ] = HostJSON.hosts(%{hosts: hosts})
  end
end
