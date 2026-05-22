# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule TrentoWeb.AIAssistant.ToolCatalog.Entry do
  @moduledoc """
  One catalog entry for `TrentoWeb.AIAssistant.ToolCatalog`.

  Each entry names a `{controller, action}` pair (single source of truth for
  HTTP method + path: looked up from `TrentoWeb.Router.__routes__/0` at tool
  build time) plus two labels:

    * `tool_name` — the machine-friendly identifier exposed to the LLM
      (e.g. `"Host_list"`). Must match the Gemini function-calling regex
      `[a-zA-Z_][a-zA-Z0-9_-]*`.
    * `display_text` — the human-friendly label rendered by the AG-UI
      tool-call card. Propagates via `LangChain.Function.display_text`.
  """

  @enforce_keys [:controller, :action, :tool_name, :display_text]
  defstruct [:controller, :action, :tool_name, :display_text]

  @type t :: %__MODULE__{
          controller: module(),
          action: atom(),
          tool_name: String.t(),
          display_text: String.t()
        }
end
