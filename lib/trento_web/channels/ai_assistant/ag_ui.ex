# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule TrentoWeb.AIAssistant.AgUi do
  @moduledoc """
  AG-UI protocol emission helpers for `TrentoWeb.AIAssistantChannel`.

  Every public function takes and returns the socket so the channel
  pipes cleanly. Wire encoding (camelCase + nil-strip + JSON round-trip)
  delegates to `AgUi.Encoder.EventEncoder.encode_json/1`.
  """

  alias Phoenix.Channel
  alias Phoenix.Socket

  alias AgUi.Core.Events.{
    RunError,
    RunFinished,
    RunStarted,
    TextMessageContent,
    TextMessageEnd,
    TextMessageStart,
    ToolCallArgs,
    ToolCallEnd,
    ToolCallResult,
    ToolCallStart
  }

  alias AgUi.Encoder.EventEncoder

  alias Trento.AI.Agent, as: TrentoAIAgent

  @spec run_started(Socket.t(), String.t(), String.t()) :: Socket.t()
  def run_started(socket, run_id, thread_id),
    do: push_event(socket, %RunStarted{run_id: run_id, thread_id: thread_id})

  @spec run_finished(Socket.t(), String.t(), String.t()) :: Socket.t()
  def run_finished(socket, run_id, thread_id),
    do: push_event(socket, %RunFinished{run_id: run_id, thread_id: thread_id})

  @spec run_error(Socket.t(), String.t()) :: Socket.t()
  def run_error(socket, message),
    do:
      message
      |> TrentoAIAgent.format_error()
      |> then(&push_event(socket, %RunError{message: &1}))

  @doc """
  Emits `TEXT_MESSAGE_START` once per run. Skipped if `:message_started`
  is already true. Flips `:message_started` to true on emit.
  """
  @spec maybe_text_message_start(Socket.t()) :: Socket.t()
  def maybe_text_message_start(%{assigns: %{message_started: true}} = socket), do: socket

  def maybe_text_message_start(%{assigns: %{message_id: message_id}} = socket),
    do:
      socket
      |> push_event(%TextMessageStart{message_id: message_id, role: "assistant"})
      |> Socket.assign(:message_started, true)

  @spec maybe_text_message_content(Socket.t(), String.t(), String.t()) :: Socket.t()
  def maybe_text_message_content(socket, _message_id, ""), do: socket

  def maybe_text_message_content(socket, message_id, delta_text),
    do: push_event(socket, %TextMessageContent{message_id: message_id, delta: delta_text})

  @doc """
  Emits `TEXT_MESSAGE_END` only when `message_started?` is true. Skips
  otherwise to avoid the orphan-pair bug (END without START).
  """
  @spec maybe_text_message_end(Socket.t(), boolean(), String.t()) :: Socket.t()
  def maybe_text_message_end(socket, true, message_id),
    do: push_event(socket, %TextMessageEnd{message_id: message_id})

  def maybe_text_message_end(socket, _started, _message_id), do: socket

  @doc """
  Emits the full tool-call lifecycle (Start + Args + End) back-to-back.
  Sagents collapses streamed argument JSON into a single map before
  broadcasting `:tool_call_identified`, so we synthesize the trio from
  one in-memory payload — assistant-ui doesn't care whether Args is
  1 chunk or N.
  """
  @spec tool_call_lifecycle(Socket.t(), map(), String.t()) :: Socket.t()
  def tool_call_lifecycle(
        socket,
        %{call_id: call_id, name: name, arguments: arguments} = tool_info,
        parent_message_id
      ),
      do:
        socket
        |> push_event(%ToolCallStart{
          tool_call_id: call_id,
          tool_call_name: tool_info[:display_text] || name,
          parent_message_id: parent_message_id
        })
        |> push_event(%ToolCallArgs{tool_call_id: call_id, delta: Jason.encode!(arguments)})
        |> push_event(%ToolCallEnd{tool_call_id: call_id})

  @spec tool_call_result(Socket.t(), String.t(), term()) :: Socket.t()
  def tool_call_result(socket, call_id, result),
    do:
      push_event(socket, %ToolCallResult{
        message_id: "tool_result_#{call_id}",
        tool_call_id: call_id,
        content: Jason.encode!(result),
        role: "tool"
      })

  @spec push_event(Socket.t(), struct()) :: Socket.t()
  defp push_event(socket, event) do
    event
    |> EventEncoder.encode_json()
    |> Jason.decode!()
    |> then(&Channel.push(socket, "ag_ui_event", &1))

    socket
  end
end
