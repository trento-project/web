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
      use Ecto.Schema
      import Ecto.Changeset

      @derive {Jason.Encoder, except: [:__struct__]}
      @primary_key false
      embedded_schema do
        field :value, unquote(value_type), unquote(value_opts)
      end

      def changeset(%__MODULE__{} = struct, params) do
        struct
        |> cast(params, [:value])
        |> validate_required([:value])
      end

      defoverridable changeset: 2
    end
  end
end
