defmodule TrentoWeb.V2.ClusterController do
  use TrentoWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias Trento.Clusters

  alias TrentoWeb.OpenApi.V2.Schema

  plug OpenApiSpex.Plug.CastAndValidate, json_render_error_v2: true
  action_fallback TrentoWeb.FallbackController

  operation :list,
    summary: "List Pacemaker Clusters.",
    tags: ["Target Infrastructure"],
    description:
      "Retrieves a comprehensive list of all Pacemaker Clusters discovered on the target infrastructure, supporting monitoring and management tasks for administrators.",
    responses: [
      ok:
        {"Comprehensive list of all Pacemaker Clusters discovered on the target infrastructure for monitoring and management.",
         "application/json", Schema.Cluster.PacemakerClustersCollection}
    ]

  def list(conn, _) do
    clusters = Clusters.get_all_clusters()

    render(conn, :clusters, clusters: clusters)
  end
end
