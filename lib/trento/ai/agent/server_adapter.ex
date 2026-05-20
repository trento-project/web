# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.AI.Agent.ServerAdapter do
  @moduledoc """
  Behaviour wrapping the subset of `Sagents.AgentServer` that
  `Trento.AI.Agent.run/1` calls into.

  Configurable via `:ai_sagents_server_adapter` so tests can substitute
  a Mox mock without booting the real sagents stack.
  """

  alias LangChain.Message

  @callback subscribe(String.t()) :: :ok | {:error, term()}
  @callback add_message(String.t(), Message.t()) :: :ok | {:error, term()}

  def subscribe(agent_id), do: impl().subscribe(agent_id)
  def add_message(agent_id, message), do: impl().add_message(agent_id, message)

  defp impl,
    do: Application.get_env(:trento, :ai_sagents_server_adapter, __MODULE__.SagentsAgentServer)

  defmodule SagentsAgentServer do
    @moduledoc false
    @behaviour Trento.AI.Agent.ServerAdapter

    defdelegate subscribe(agent_id), to: Sagents.AgentServer
    defdelegate add_message(agent_id, message), to: Sagents.AgentServer
  end
end
