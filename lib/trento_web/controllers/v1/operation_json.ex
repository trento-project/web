# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule TrentoWeb.V1.OperationJSON do
  def bulk_operation_accepted(%{
        bulk_operation_id: bulk_operation_id,
        operations: operations,
        failed_requests: failed_requests
      }) do
    %{
      bulk_operation_id: bulk_operation_id,
      operations: operations,
      failed_requests:
        Enum.map(failed_requests, fn %{reason: reason} = failed_request ->
          %{failed_request | reason: inspect(reason)}
        end)
    }
  end
end
