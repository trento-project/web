# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.AI.FakeChatModel do
  @moduledoc """
  A `LangChain.ChatModels.ChatModel` that never talks to a provider.

  Exists so integration tests can hold a `Sagents.AgentServer` run genuinely
  in flight — the only state in which `Trento.AI.Agent.cancel/1` does anything
  — without a network call.

  `call/3` runs inside the agent's run task and parks there:

  - `:notify` (pid) receives `{:llm_called, task_pid}` as soon as the chain
    reaches the model, so a test can wait for a *real* in-flight run instead
    of sleeping.
  - the park ends on a `:release` message (answers with `:reply`) or after
    `:block_for` ms. The timeout is the CI guard: a cancel that fails to kill
    the task makes the test fail on its own assertions rather than hang.

  `:callbacks` is required by `LangChain.Utils.rewrap_callbacks_for_model/3`,
  which writes the chain's wrapped callbacks onto the model struct.
  """

  @behaviour LangChain.ChatModels.ChatModel

  alias LangChain.Message

  defstruct callbacks: [], notify: nil, block_for: 5_000, reply: "fake reply"

  @type t :: %__MODULE__{
          callbacks: [map()],
          notify: pid() | nil,
          block_for: non_neg_integer(),
          reply: String.t()
        }

  @impl LangChain.ChatModels.ChatModel
  def call(%__MODULE__{notify: notify, block_for: block_for, reply: reply}, _messages, _tools) do
    if is_pid(notify), do: send(notify, {:llm_called, self()})

    receive do
      :release -> {:ok, [Message.new_assistant!(reply)]}
    after
      block_for -> {:ok, [Message.new_assistant!(reply)]}
    end
  end

  @impl LangChain.ChatModels.ChatModel
  def retry_on_fallback?(_error), do: false

  @impl LangChain.ChatModels.ChatModel
  def serialize_config(%__MODULE__{}), do: %{"module" => Atom.to_string(__MODULE__)}

  @impl LangChain.ChatModels.ChatModel
  def restore_from_map(_data), do: {:ok, %__MODULE__{}}
end
