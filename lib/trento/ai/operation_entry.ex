# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.AI.OperationEntry do
  @moduledoc """
  Transport-agnostic catalog entry shared by every `Trento.AI.ToolSource`
  that derives AI tools from `%OpenApiSpex.Operation{}` structs.

  Self-describing — the HTTP verb + path template are baked in at
  construction time so dispatchers don't need to re-walk the source
  document per tool call.

  `TrentoWeb.AI.McpRouteIndex.Entry` is the local-controller counterpart
  with two extra fields (`:controller`, `:action`). Remote sources use
  this struct directly.
  """

  @enforce_keys [:tool_name, :operation, :verb, :path]
  defstruct [:tool_name, :display_text, :operation, :verb, :path]

  @type t :: %__MODULE__{
          tool_name: String.t(),
          display_text: String.t() | nil,
          operation: OpenApiSpex.Operation.t(),
          verb: atom(),
          path: String.t()
        }
end
