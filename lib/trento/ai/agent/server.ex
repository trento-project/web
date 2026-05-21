# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.AI.Agent.Server do
  @moduledoc """
  Behaviour wrapping the subset of `Sagents.AgentServer` that
  `Trento.AI.Agent.run/2` calls into.

  Default production implementation lives at
  `Trento.Infrastructure.AI.SagentsAgentServer`. Override via the
  `:trento, :ai, agent_server_adapter:` config so tests can substitute
  a Mox mock without booting the real sagents stack.
  """

  alias LangChain.Message

  alias Trento.AI.ApplicationConfigLoader

  @callback subscribe(String.t()) :: :ok | {:error, term()}
  @callback add_message(String.t(), Message.t()) :: :ok | {:error, term()}

  def subscribe(agent_id), do: impl().subscribe(agent_id)
  def add_message(agent_id, message), do: impl().add_message(agent_id, message)

  defp impl, do: Keyword.get(ApplicationConfigLoader.load(), :agent_server_adapter)
end
