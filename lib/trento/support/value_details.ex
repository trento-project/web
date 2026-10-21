# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Support.ValueDetails do
  @moduledoc """
  ValueDetails struct blueprint

  Module intended to be used in `use` expressions to define derived modules having the same structure of their struct but configurable type for the `value` field.
  """
  defmacro __using__(opts) do
    value_type = Keyword.fetch!(opts, :value_type)
    value_opts = Keyword.delete(opts, :value_type)

    quote do
      @required_fields [:value]

      use Trento.Support.Type

      deftype do
        field :value, unquote(value_type), unquote(value_opts)
      end
    end
  end
end
