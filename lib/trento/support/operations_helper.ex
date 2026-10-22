# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

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

  @spec reduce_bulk_operation_request(
          resource_ids :: [String.t()],
          request_func :: (String.t() -> {:ok, String.t()} | {:error, any})
        ) ::
          {String.t(), [%{resource_id: String.t(), operation_id: String.t()}],
           [%{resource_id: String.t(), reason: any}]}
  def reduce_bulk_operation_request(resource_ids, request_func) do
    bulk_operation_id = UUID.uuid4()

    {operations, failed_operations} =
      Enum.reduce(resource_ids, {[], []}, fn resource_id, {operations, failed} ->
        case request_func.(resource_id) do
          {:ok, operation_id} ->
            {[%{resource_id: resource_id, operation_id: operation_id} | operations], failed}

          {:error, reason} ->
            {operations, [%{resource_id: resource_id, reason: reason} | failed]}
        end
      end)

    {bulk_operation_id, Enum.reverse(operations), Enum.reverse(failed_operations)}
  end

  @spec build_error(message :: String.t(), metadata :: [metadata()]) :: forbidden_error
  def build_error(message, metadata \\ []), do: %{message: message, metadata: metadata}

  @spec to_bulk_operation(operation :: [atom] | atom) :: [atom] | atom
  def to_bulk_operation(operations) when is_list(operations),
    do: Enum.map(operations, &to_bulk_operation/1)

  def to_bulk_operation(operation), do: :"bulk_#{operation}"
end
