defmodule Trento.Clusters.Enums.ClusterState do
  @moduledoc """
  Type that represents the cluster state.
  Values are coming from pacemaker directly:
  https://github.com/ClusterLabs/pacemaker/blob/main/daemons/controld/controld_fsa.h#L23

  The value sent by the agent has the `S_` removed and it is downcased.
  :stopped and :unknown are custom Trento values.
  """

  use Trento.Support.Enum,
    values: [
      :idle,
      :election,
      :integration,
      :finalize_join,
      :not_dc,
      :policy_engine,
      :recovery,
      :release_dc,
      :starting,
      :pending,
      :stopping,
      :terminate,
      :transition_engine,
      :s_max,
      :stopped,
      :unknown
    ]
end
