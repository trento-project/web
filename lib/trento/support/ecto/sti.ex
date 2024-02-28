defmodule Trento.Support.Ecto.STI do
  @moduledoc """
    Helpers module for Single Table Inheritance in ecto schemas
  """

  defmacro sti_fields() do
    quote do
      field :type, Ecto.Enum, values: [@sti_identifier]
    end
  end

  defmacro __using__(opts) do
    sti_type_identifier =
      Keyword.get(opts, :sti_identifier) ||
        raise("""
          Missing :sti_identifier option when including STI Helpers
        """)

    quote do
      import Ecto.Query, only: [from: 2]
      import Ecto.Changeset, only: [put_change: 3]
      import Trento.Support.Ecto.STI, only: [sti_fields: 0]

      @sti_identifier unquote(sti_type_identifier)

      def base_query(),
        do: from(s in __MODULE__, where: s.type == unquote(sti_type_identifier))

      def sti_column_value, do: unquote(sti_type_identifier)

      def sti_changes(changeset) do
        put_change(changeset, :type, unquote(sti_type_identifier))
      end
    end
  end
end
