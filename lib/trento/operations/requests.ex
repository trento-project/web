# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Operations.Requests do
  @moduledoc """
  Requests an operation on a target after checking the operation policies,
  without an HTTP connection.

  This is the same check `TrentoWeb.Plugs.OperationsPolicyPlug` does for a
  manual request, so that scheduled (and, later, bulk) requests honor the same
  preconditions. Only hosts are supported in this proof of concept.

  "Another operation is already running" is not checked here: wanda refuses
  the request and replies with OperationCompleted REQUEST_FAILED/ALREADY_RUNNING.
  """

  alias Trento.Hosts
  alias Trento.Hosts.Projections.HostReadModel
  alias Trento.Operations.HostPolicy
  alias Trento.Repo

  @spec load_resource(:host, String.t()) :: HostReadModel.t() | nil
  def load_resource(:host, host_id) do
    HostReadModel
    |> Repo.get(host_id)
    |> Repo.preload([:cluster, :application_instances, :database_instances])
  end

  @spec request(:host, String.t(), atom(), map()) ::
          {:ok, String.t()}
          | {:error, :not_found}
          | {:error, :forbidden, list()}
          | {:error, any()}
  def request(:host, host_id, operation, params) do
    case load_resource(:host, host_id) do
      nil ->
        {:error, :not_found}

      host ->
        with :ok <- authorize(HostPolicy, operation, host, params) do
          Hosts.request_operation(operation, host_id, params)
        end
    end
  end

  defp authorize(policy, operation, resource, params) do
    case policy.authorize_operation(operation, resource, params) do
      :ok -> :ok
      {:error, errors} -> {:error, :forbidden, errors}
    end
  end
end
