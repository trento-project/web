defmodule Trento.ActivityLog do
  @moduledoc """
  Activity Log module provides functionality to manage activity log settings and track activity.
  """

  import Ecto.Query

  require Logger

  alias Trento.ActivityLog.ActivityLog
  alias Trento.ActivityLog.MetadataQueryParser
  alias Trento.ActivityLog.RetentionTime
  alias Trento.Repo
  alias Trento.Settings

  @user_management_log_types [
    "login_attempt",
    "user_creation",
    "user_modification",
    "user_deletion",
    "profile_update"
  ]

  @spec list_activity_log(map()) ::
          {:ok, list(ActivityLog.t()), Flop.Meta.t()} | {:error, :activity_log_fetch_error}
  def list_activity_log(params, include_all_log_types? \\ false) do
    parsed_params = parse_params(params)

    case ActivityLog
         |> maybe_exclude_user_logs(include_all_log_types?)
         |> maybe_search_by_metadata(params)
         |> Flop.validate_and_run(parsed_params, for: ActivityLog) do
      {:ok, {activity_log_entries, meta}} ->
        {:ok, activity_log_entries, meta}

      error ->
        Logger.error("Activity log fetch error: #{inspect(error)}")
        {:error, :activity_log_fetch_error}
    end
  end

  @spec clear_expired_logs() :: :ok | {:error, any()}
  def clear_expired_logs do
    with {:ok, %{retention_time: retention_time}} <- Settings.get_activity_log_settings(),
         expiration_date <- calculate_expiration_date(retention_time) do
      delete_logs_before(expiration_date)
      :ok
    end
  end

  defp maybe_exclude_user_logs(ActivityLog = q, true = _include_all_log_types?), do: q

  defp maybe_exclude_user_logs(ActivityLog = q, false = _include_all_log_types?) do
    from(l in q, where: l.type not in @user_management_log_types)
  end

  defp maybe_search_by_metadata(query, params) do
    maybe_metadata_search_string = params[:search]

    case MetadataQueryParser.parse(maybe_metadata_search_string) do
      {:ok, jsonpath_expr} ->
        from q in query,
          select: %{
            id: q.id,
            metadata: q.metadata,
            m0: fragment("jsonb_path_query(?, ?)", q.metadata, ^jsonpath_expr),
            type: q.type,
            actor: q.actor,
            inserted_at: q.inserted_at,
            updated_at: q.updated_at
          }

      {:error, :noop, _} ->
        query

      {:error, _, trimmed_search_string} = error ->
        Logger.info(
          "Metadata parse failure for search string \"#{trimmed_search_string}\": #{inspect(error)}"
        )

        # search query parsing failed, no entries will be returned
        from q in query, where: false
    end
  end

  # ''&& false' is a workaround until we reach OTP 27 that allows doc tag for private functions;
  # we get a compile warning without this with OTP 26
  @doc """
       Parses the query parameters and returns a map with the parsed values as expected by the Flop library.
       Some parameters are recognized by Flop and are used as is (example: last, first, after, before);
       some other parameters are used to build filters with custom operator logic (example: from_date, to_date, actor, type).
       ## Examples
             iex> parse_params([{:from_date, "2021-01-31"}, {:to_date, "2021-01-01"}, last: 10])
       %{
          filters: [
                     %{value: "2021-01-31", op: :<=, field: :inserted_at},
                     %{value: "2021-01-01", op: :>=, field: :inserted_at}],
          last: 10
       }
       """ && false
  @spec parse_params(map()) :: map()
  defp parse_params(query_params) when query_params == %{} do
    # Implies
    # %{first: 25, order_by: [:inserted_at], order_directions: [:desc]}
    %{}
  end

  defp parse_params(query_params) do
    query_params
    |> Enum.map(fn
      {:from_date, v} ->
        {:filters, %{field: :inserted_at, op: :<=, value: v}}

      {:to_date, v} ->
        {:filters, %{field: :inserted_at, op: :>=, value: v}}

      {:actor, v} ->
        {:filters, %{field: :actor, op: :ilike_or, value: v}}

      {:type, v} ->
        {:filters, %{field: :type, op: :ilike_or, value: v}}

      param ->
        param
    end)
    |> Enum.reduce(%{filters: []}, fn
      {:filters, filter}, acc ->
        Map.put(acc, :filters, [filter | acc.filters])

      {k, v}, acc ->
        Map.put(acc, k, v)
    end)
  end

  defp calculate_expiration_date(%RetentionTime{value: value, unit: :day}),
    do: DateTime.add(DateTime.utc_now(), -value, :day)

  defp calculate_expiration_date(%RetentionTime{value: value, unit: :week}),
    do: DateTime.add(DateTime.utc_now(), -value * 7, :day)

  defp calculate_expiration_date(%RetentionTime{value: value, unit: :month}),
    do: DateTime.add(DateTime.utc_now(), -value * 30, :day)

  defp calculate_expiration_date(%RetentionTime{value: value, unit: :year}),
    do: DateTime.add(DateTime.utc_now(), -value * 365, :day)

  defp delete_logs_before(%DateTime{} = expiration_date) do
    Repo.delete_all(from l in ActivityLog, where: l.inserted_at < ^expiration_date)
  end
end
