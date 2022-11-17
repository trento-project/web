defmodule TrentoWeb.ChecksResultView do
  use TrentoWeb, :view

  def render("checks_results_updated.json", %{
        data: %{
          host_id: host_id,
          cluster_id: cluster_id,
          reachable: reachable,
          msg: msg,
          checks_results: checks_results
        }
      }) do
    %{
      cluster_id: cluster_id,
      host_id: host_id,
      hosts_executions: [
        %{cluster_id: cluster_id, host_id: host_id, reachable: reachable, msg: msg}
      ],
      checks_results: checks_results
    }
  end

  def render("checks_execution_completed.json", %{data: %{cluster_id: cluster_id}}),
    do: %{cluster_id: cluster_id}
end
