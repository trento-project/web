# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule TrentoWeb.AIAssistant.ToolCatalog.Entry do
  @moduledoc """
  One catalog entry for `TrentoWeb.AIAssistant.ToolCatalog`.

  Built at compile time from a `Phoenix.Router` route + the controller's
  OpenApiSpex operation. Carries everything `ControllerTool.build/1` and
  `ControllerTool.invoke/3` need so neither has to call back into the
  router or into `controller.open_api_operation/1` at runtime.
  """

  @enforce_keys [:controller, :action, :verb, :path, :tool_name, :operation]
  defstruct [:controller, :action, :verb, :path, :tool_name, :display_text, :operation]

  @type t :: %__MODULE__{
          controller: module(),
          action: atom(),
          verb: :get | :post | :put | :patch | :delete,
          path: String.t(),
          tool_name: String.t(),
          display_text: String.t() | nil,
          operation: OpenApiSpex.Operation.t()
        }
end
