defmodule Trento.Clusters.Enums.ClusterState do
  @moduledoc """
  Type that represents the cluster state.
  Values are coming from pacemaker directly:
  https://github.com/ClusterLabs/pacemaker/blob/main/daemons/controld/controld_fsa.h#L23

  :stopped and :unknown are custom Trento values.
  """

  use Trento.Support.Enum,
    values: [
      :S_IDLE,
      :S_ELECTION,
      :S_INTEGRATION,
      :S_FINALIZE_JOIN,
      :S_NOT_DC,
      :S_POLICY_ENGINE,
      :S_RECOVERY,
      :S_RELEASE_DC,
      :S_STARTING,
      :S_PENDING,
      :S_STOPPING,
      :S_TERMINATE,
      :S_TRANSITION_ENGINE,
      :S_MAX,
      :stopped,
      :unknown
    ]
end
