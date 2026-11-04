# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Operations.PolicyBehaviour do
  @moduledoc """
  Behaviour of the operations policies.
  """

  alias Trento.Support.OperationsHelper

  @callback authorize_operation(
              operation :: atom,
              read_model :: struct(),
              params :: map
            ) :: :ok | {:error, [OperationsHelper.forbidden_error()]}

  @callback metadata(read_model :: struct()) :: OperationsHelper.metadata()
end
