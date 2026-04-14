defmodule Trento.Support.OperationsHelper do
  @moduledoc """
  Helper functions for operations
  """

  @type metadata :: %{
          id: Ecto.UUID.t(),
          label: String.t(),
          type: :host | :cluster | :sap_system | :database
        }

  @type forbidden_error :: %{
          message: String.t(),
          metadata: [metadata()]
        }

  @spec reduce_operation_authorizations(
          authorizations :: [Enumerable.t()],
          acc :: :ok | {:error, [forbidden_error()]}
        ) ::
          :ok | {:error, [forbidden_error]}
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
          acc :: :ok | {:error, [forbidden_error()]},
          func :: function()
        ) ::
          :ok | {:error, [forbidden_error]}
  def reduce_operation_authorizations(authorizations, acc, fun) do
    authorizations
    |> Enum.map(fn x -> fun.(x) end)
    |> reduce_operation_authorizations(acc)
  end

  @spec build_error(message :: String.t(), metadata :: [metadata()]) :: forbidden_error
  def build_error(message, metadata \\ []), do: %{message: message, metadata: metadata}
end
