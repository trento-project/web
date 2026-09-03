# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.AI.FakeChatModel do
  @moduledoc """
  A `LangChain.ChatModels.ChatModel` that never talks to a provider.

  Exists so integration tests can hold a `Sagents.AgentServer` run genuinely
  in flight - the only state in which `Trento.AI.Agent.cancel/1` does anything
  - without a network call.

  `call/3` runs inside the agent's run task and parks there:

  - `:notify` (pid) receives `{:llm_called, task_pid}` as soon as the chain
    reaches the model, so a test can wait for a *real* in-flight run instead
    of sleeping.
  - the park ends on a `:release` message or after `:block_for` ms. The
    timeout is the CI guard: a cancel that fails to kill the task makes the
    test fail on its own assertions rather than hang.

  `:reply` decides what the park ends with:

  - a chunk of text, or a list of them - one `%MessageDelta{}` per element,
    each fired through `:on_llm_new_delta` as a provider fires one per
    received chunk. Every Trento model is built with `stream: true`, so this
    is the return shape production sees.
  - `{:error, reason}` - the failing-run path, `reason` being a message or a
    ready-made `%LangChainError{}`.

  Does not cover from drifts in the actual used models.

  `:callbacks` is required by `LangChain.Utils.rewrap_callbacks_for_model/3`,
  which writes the chain's wrapped callbacks onto the model struct.
  """

  @behaviour LangChain.ChatModels.ChatModel

  alias LangChain.LangChainError
  alias LangChain.Message.ContentPart
  alias LangChain.MessageDelta
  alias LangChain.Utils

  defstruct callbacks: [], notify: nil, block_for: 5_000, reply: "fake reply"

  @type reply :: String.t() | [String.t()] | {:error, String.t() | LangChainError.t()}

  @type t :: %__MODULE__{
          callbacks: [map()],
          notify: pid() | nil,
          block_for: non_neg_integer(),
          reply: reply()
        }

  @impl LangChain.ChatModels.ChatModel
  def call(%__MODULE__{notify: notify, block_for: block_for} = model, _messages, _tools) do
    if is_pid(notify), do: send(notify, {:llm_called, self()})

    receive do
      :release -> answer(model)
    after
      block_for -> answer(model)
    end
  end

  @impl LangChain.ChatModels.ChatModel
  def retry_on_fallback?(_error), do: false

  @impl LangChain.ChatModels.ChatModel
  def serialize_config(%__MODULE__{}), do: %{"module" => Atom.to_string(__MODULE__)}

  @impl LangChain.ChatModels.ChatModel
  def restore_from_map(_data), do: {:ok, %__MODULE__{}}

  defp answer(%__MODULE__{reply: {:error, %LangChainError{} = error}}), do: {:error, error}

  defp answer(%__MODULE__{reply: {:error, message}}) when is_binary(message),
    do: {:error, LangChainError.exception(type: "fake_error", message: message)}

  defp answer(%__MODULE__{reply: reply} = model) do
    reply
    |> List.wrap()
    |> deltas()
    |> tap(fn deltas -> Enum.each(deltas, &Utils.fire_streamed_callback(model, [&1])) end)
    |> then(fn deltas -> {:ok, deltas} end)
  end

  defp deltas(chunks) do
    last_index = length(chunks) - 1

    chunks
    |> Enum.with_index()
    |> Enum.map(fn {chunk, chunk_index} ->
      MessageDelta.new!(%{
        role: :assistant,
        content: ContentPart.new!(%{type: :text, content: chunk}),
        index: 0,
        status: if(chunk_index == last_index, do: :complete, else: :incomplete)
      })
    end)
  end
end
