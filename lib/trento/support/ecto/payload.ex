defmodule Trento.Support.Ecto.Payload do
  @moduledoc """
  Ecto Type that represents a JSONB payload that contains an array or a map.

  Opts:
  - keys_as_atoms (boolean): Converts map keys to existing atoms
  """

  alias Trento.Support.StructHelper

  use Ecto.ParameterizedType

  def type(_params), do: :map

  def init(opts) do
    keys_as_atoms = Keyword.get(opts, :keys_as_atoms, false)

    validate_opts(keys_as_atoms)

    %{
      keys_as_atoms: keys_as_atoms
    }
  end

  # Provide custom casting rules.
  def cast(data, _params) when is_list(data) or is_map(data) do
    {:ok, data}
  end

  def cast(nil, _), do: {:ok, nil}

  # Everything else is a failure though
  def cast(_, _), do: :error

  # When loading data from the database, we are guaranteed to
  # receive a map or list. It will convert keys to atoms if `keys_as_atoms` is set to true
  def load(data, _loader, %{keys_as_atoms: false}) when is_list(data) or is_map(data) do
    {:ok, data}
  end

  def load(data, _loader, %{keys_as_atoms: true}) when is_list(data) or is_map(data) do
    {:ok, StructHelper.to_atomized_map(data)}
  end

  def load(nil, _, _), do: {:ok, nil}

  # When dumping data to the database, we *expect* a map or list
  # so we need to guard against them.
  def dump(data, _dumper, _params) when is_list(data) or is_map(data), do: {:ok, data}
  def dump(nil, _, _), do: {:ok, nil}
  def dump(_, _, _), do: :error

  defp validate_opts(keys_as_atoms) when not is_boolean(keys_as_atoms),
    do:
      raise(ArgumentError, """
      Trento.Support.Ecto.Payload type keys_as_atoms must be a boolean.
      """)

  defp validate_opts(_), do: nil
end
