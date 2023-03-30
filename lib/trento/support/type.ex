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
      Returns an ok tuple if the params are valid, otherwise returns `{:error, {:validation, errors}}`.
      Accepts a map or a list of maps.
      """
      @spec new(map | [map]) :: {:ok, t() | [t()]} | {:error, any}
      def new(structs) when is_list(structs) do
        structs
        |> Enum.map(fn item -> __MODULE__.new(item) end)
        |> Enum.group_by(
          fn {is_valid, _} -> is_valid end,
          fn {_, decoding_value} -> decoding_value end
        )
        |> map_results()
      end

      def new(params) do
        case changeset(struct(__MODULE__), params) do
          %{valid?: true} = changes ->
            {:ok, apply_changes(changes)}

          changes ->
            {:error,
             {:validation,
              Ecto.Changeset.traverse_errors(
                changes,
                fn {msg, _} -> msg end
              )}}
        end
      end

      @doc """
      Returns new struct(s) if the params are valid, otherwise raises a `RuntimeError`.
      """
      @spec new!(map | [map]) :: t() | [t()]
      def new!(params) do
        case new(params) do
          {:ok, value} -> value
          {:error, {:validation, reason}} -> raise RuntimeError, message: inspect(reason)
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
        changeset =
          struct
          |> cast(params, fields())
          |> validate_required_fields(@required_fields)

        Enum.reduce(embedded_fields(), changeset, fn field, changeset ->
          cast_and_validate_required_embed(changeset, field, @required_fields)
        end)
      end

      def validate_required_fields(changeset, nil), do: changeset

      def validate_required_fields(changeset, :all),
        do:
          Ecto.Changeset.validate_required(
            changeset,
            fields()
          )

      def validate_required_fields(changeset, required_fields),
        do:
          Ecto.Changeset.validate_required(
            changeset,
            Enum.filter(fields(), fn field ->
              field in required_fields
            end)
          )

      def cast_and_validate_required_embed(changeset, field, nil),
        do: cast_embed(changeset, field)

      def cast_and_validate_required_embed(changeset, field, :all),
        do: cast_embed(changeset, field, required: true)

      def cast_and_validate_required_embed(changeset, field, required_fields),
        do: cast_embed(changeset, field, required: field in required_fields)

      defp map_results(%{error: errors}),
        do: {:error, map_errors(errors)}

      defp map_results(%{ok: results}), do: {:ok, results}
      defp map_results(_), do: {:ok, []}

      defp map_errors(errors),
        do: {:validation, Enum.map(errors, fn {:validation, error} -> error end)}

      defp fields, do: __MODULE__.__schema__(:fields) -- __MODULE__.__schema__(:embeds)

      defp embedded_fields, do: __MODULE__.__schema__(:embeds)

      defoverridable new: 1
      defoverridable changeset: 2
    end
  end
end
