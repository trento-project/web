defmodule Trento.Support.OperationsHelper do
  @moduledoc """
  Helper functions for operations
  """

  @spec reduce_operation_authorizations(
          authorizations :: [Enumerable.t()],
          acc :: :ok | {:error, [String.t()]}
        ) ::
          :ok | {:error, [String.t()]}
  def reduce_operation_authorizations(authorizations, acc \\ :ok) do
    Enum.reduce(authorizations, acc, fn
      :ok, :ok ->
        :ok

      :ok, {:error, errors} ->
        {:error, errors}

      {:error, errors}, :ok ->
        {:error, errors}

      {:error, new_errors}, {:error, errors} ->
        {:error, errors |> Enum.concat(new_errors) |> Enum.uniq()}
    end)
  end

  @spec reduce_operation_authorizations(
          authorizations :: [Enumerable.t()],
          acc :: :ok | {:error, [String.t()]},
          func :: function()
        ) ::
          :ok | {:error, [String.t()]}
  def reduce_operation_authorizations(authorizations, acc, fun) do
    authorizations
    |> Enum.map(fn x -> fun.(x) end)
    |> reduce_operation_authorizations(acc)
  end
end
