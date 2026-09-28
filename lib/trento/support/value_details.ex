# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Support.ValueDetails do
  @moduledoc """
  ValueDetails struct blueprint

  Module intended to be used in a `use` expressions to define derived modules having the the same structure of their struct but configurable type for the `value` field.
  """
  defmacro __using__(opts) do
    value_type = Keyword.fetch!(opts, :value_type)
    value_opts = Keyword.delete(opts, :value_type)

    quote do
      use Ecto.Schema
      import Ecto.Changeset

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

defmodule Trento.Support.HealthValueDetails do
  @moduledoc """
  ValueDetails struct with Trento.Enums.Health as `value` field type.
  """
  require Trento.Enums.Health, as: Health

  use Trento.Support.ValueDetails,
    value_type: Ecto.Enum,
    values: Health.values(),
    default: Health.unknown()
end
