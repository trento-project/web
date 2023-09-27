defmodule TrentoWeb.V1.HostViewTest do
  @moduledoc false

  use TrentoWeb.ConnCase, async: true

  import Phoenix.View
  import Trento.Factory

  alias TrentoWeb.V1.HostView

  alias Trento.HostReadModel

  test "should render health changed relevant information" do
    %HostReadModel{id: id} = host = build(:host, health: :passing)

    assert %{id: id, health: :passing} ==
             render(HostView, "host_health_changed.json", %{host: host})
  end

  test "should render host details relevant information" do
    host = build(:host)

    rendered_map = render(HostView, "host_details_updated.json", %{host: host})

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
end
