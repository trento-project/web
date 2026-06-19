# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule TrentoWeb.AI.McpRouteIndex.Entry do
  @moduledoc """
  One catalog entry for `TrentoWeb.AI.McpRouteIndex`.

  Built from a `Phoenix.Router` route + the controller's OpenApiSpex
  operation. Self-describing — HTTP verb + path template are baked in
  at construction time so `TrentoWeb.AI.ControllerTool.invoke/3` can
  dispatch without re-scanning the router per call.
  """

  @enforce_keys [:controller, :action, :tool_name, :operation, :verb, :path]
  defstruct [:controller, :action, :tool_name, :display_text, :operation, :verb, :path]

  @type t :: %__MODULE__{
          controller: module(),
          action: atom(),
          tool_name: String.t(),
          display_text: String.t() | nil,
          operation: OpenApiSpex.Operation.t(),
          verb: atom(),
          path: String.t()
        }
end
