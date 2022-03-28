defmodule Trento.Type do
  @moduledoc """
  This module defines the macro `deftype` which is used to define a new type,
  for data mapping and validation by wrapping Ecto.Schema and Ecto.Changeset.
  """

  import Ecto.Schema, only: [embedded_schema: 1]

  defmacro deftype(block) do
    quote do
      embedded_schema(unquote(block))
    end
  end

  defmacro __using__(_opts) do
    quote do
      use Ecto.Schema
      import Trento.Type, only: [deftype: 1]

      import Ecto.Changeset

      @type t() :: %__MODULE__{}

      @primary_key false

      @derive Jason.Encoder

      @doc """
      Returns `{:ok, t()}` if the params are valid, otherwise returns `{:error, errors}`.
      """
      @spec new(map) :: {:ok, t()} | {:error, any}
      def new(params) do
        case changeset(struct(__MODULE__), params) do
          %{valid?: true} = changes -> {:ok, apply_changes(changes)}
          %{errors: errors} -> {:error, errors}
        end
      end

      @doc """
      Returns `t()` if the params are valid, otherwise raises a `RuntimeError`.
      """
      @spec new!(map) :: t()
      def new!(params) do
        case new(params) do
          {:ok, struct} -> struct
          {:error, reason} -> raise RuntimeError, message: reason
        end
      end

      @dialyzer {:no_match, changeset: 2}
      # we need to ignore the no_match warning of the ` {_, Ecto.Embedded, _}` case
      # since some spec is broken in the Ecto codebase

      @doc """
      Casts the fields by using Ecto reflection,
      validates the required ones and returns a changeset.
      """
      def changeset(struct, params) do
        {embedded_fields, fields} =
          :fields
          |> __MODULE__.__schema__()
          |> Enum.split_with(fn field ->
            case __MODULE__.__schema__(:type, field) do
              {_, Ecto.Embedded, _} ->
                true

              _ ->
                false
            end
          end)

        changes =
          struct
          |> cast(params, fields)
          |> validate_required_fields(@required_fields)

        Enum.reduce(embedded_fields, changes, fn field, changes ->
          cast_embed(changes, field)
        end)
      end

      def validate_required_fields(changeset, nil), do: changeset

      def validate_required_fields(changeset, :all),
        do: Ecto.Changeset.validate_required(changeset, __MODULE__.__schema__(:fields))

      def validate_required_fields(changeset, required_fields),
        do: Ecto.Changeset.validate_required(changeset, required_fields)
    end
  end
end
