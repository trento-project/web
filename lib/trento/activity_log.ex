defmodule Trento.ActivityLog do
  @moduledoc """
  Activity Log module provides functionality to manage activity log settings and track activity.
  """

  import Ecto.Query

  require Logger

  alias Trento.ActivityLog.RetentionTime
  require Trento.ActivityLog.RetentionPeriodUnit, as: RetentionPeriodUnit
  alias Trento.ActivityLog.ActivityLog
  alias Trento.ActivityLog.Settings
  alias Trento.Repo

  @user_management_log_types [
    "login_attempt",
    "user_creation",
    "user_modification",
    "user_deletion",
    "profile_update"
  ]

  @spec get_settings() ::
          {:ok, Settings.t()} | {:error, :not_found}
  def get_settings do
    case Repo.one(Settings.base_query()) do
      %Settings{} = settings -> {:ok, settings}
      nil -> {:error, :not_found}
    end
  end

  @spec change_retention_period(integer(), RetentionPeriodUnit.t()) ::
          {:ok, Settings.t()}
          | {:error, :activity_log_settings_not_configured}
  def change_retention_period(value, unit) do
    case get_settings() do
      {:ok, settings} ->
        settings
        |> Settings.changeset(%{
          retention_time: %{
            value: value,
            unit: unit
          }
        })
        |> Repo.update()
        |> log_error("Error while updating activity log retention period")

      {:error, :not_found} ->
        {:error, :activity_log_settings_not_configured}
    end
  end

  @spec clear_expired_logs() :: :ok | {:error, any()}
  def clear_expired_logs do
    with {:ok, %{retention_time: retention_time}} <- Trento.ActivityLog.get_settings(),
         expiration_date <- calculate_expiration_date(retention_time) do
      delete_logs_before(expiration_date)
      :ok
    end
  end

  @spec list_activity_log(map()) ::
          {:ok, list(ActivityLog.t()), Flop.Meta.t()} | {:error, :activity_log_fetch_error}
  def list_activity_log(params, include_all_log_types? \\ false) do
    parsed_params = parse_params(params)

    ActivityLog
    |> maybe_exclude_user_logs(include_all_log_types?)
    |> maybe_search_by_metadata(params)
    |> case do
      {:ok, query} ->
        case Flop.validate_and_run(query, parsed_params, for: ActivityLog) do
          {:ok, {activity_log_entries, meta}} ->
            {:ok, activity_log_entries, meta}

          error ->
            Logger.error("Activity log fetch error: #{inspect(error)}")
            {:error, :activity_log_fetch_error}
        end

      error ->
        Logger.error("Activity log fetch error, metadata parse failure: #{inspect(error)}")
        {:error, :activity_log_fetch_error}
    end
  end

  defp maybe_search_by_metadata(query, params) do
    maybe_metadata_search_string = params[:metadata]

    case parse_metadata_query_string(maybe_metadata_search_string) do
      {:ok, validated_query_string} ->
        {:ok,
         from(
           q in query,
           select: %{
             id: q.id,
             metadata: q.metadata,
             md:
               fragment(
                 "jsonb_path_query(?, ?)",
                 q.metadata,
                 ^validated_query_string
               ),
             type: q.type,
             actor: q.actor,
             inserted_at: q.inserted_at,
             updated_at: q.updated_at
           }
         )}

      :noop ->
        {:ok, query}

      _ ->
        {:ok, query}
    end
  end

  defp maybe_exclude_user_logs(ActivityLog = q, true = _include_all_log_types?), do: q

  defp maybe_exclude_user_logs(ActivityLog = q, false = _include_all_log_types?) do
    from(l in q, where: l.type not in @user_management_log_types)
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
      {:from_date, v} -> {:filters, %{field: :inserted_at, op: :<=, value: v}}
      {:to_date, v} -> {:filters, %{field: :inserted_at, op: :>=, value: v}}
      {:actor, v} -> {:filters, %{field: :actor, op: :ilike_or, value: v}}
      {:type, v} -> {:filters, %{field: :type, op: :ilike_or, value: v}}
      param -> param
    end)
    |> Enum.reduce(%{filters: []}, fn
      {:filters, filter}, acc ->
        Map.put(acc, :filters, [filter | acc.filters])

      {k, v}, acc ->
        Map.put(acc, k, v)
    end)
  end

  def parse_metadata_query_string(maybe_metadata_search) do
    case is_binary(maybe_metadata_search) && maybe_metadata_search != "" do
      true ->
        case do_parse_metadata_query_string(maybe_metadata_search) do
          {:ok, parsed_string} ->
            {:ok, parsed_string}

          error ->
            Logger.warning("Metadata query parse failed #{inspect(error)}")
            error
        end

      false when is_nil(maybe_metadata_search) ->
        :noop

      false ->
        Logger.error("Not a binary #{inspect(maybe_metadata_search)}")
        :error
    end
  end

  defp do_parse_metadata_query_string(query_string) do
    Logger.warning(query_string)
    starting_char = query_string |> String.trim() |> String.first()

    case starting_char do
      "$" ->
        {:ok, query_string}

      "|" ->
        parsed_rest =
          query_string
          |> String.trim_leading("|")
          |> String.split(",")
          |> Enum.map(&String.trim/1)

        case(length(parsed_rest) > 0) do
          true ->
            splice_this =
              Enum.map(parsed_rest, fn op_p -> "(@ #{op_p})" end) |> Enum.join(" || ")

            {:ok, "$.** ? (#{splice_this})"}

          _ ->
            {:error, :parse_failed_or}
        end

      "&" ->
        parsed_rest =
          query_string
          |> String.trim_leading("&")
          |> String.split(",")
          |> Enum.map(&String.trim/1)

        case(length(parsed_rest) > 0) do
          true ->
            splice_this =
              Enum.map(parsed_rest, fn op_p -> "(@ #{op_p})" end) |> Enum.join(" || ")

            {:ok, "$.** ? (#{splice_this})"}

          _ ->
            {:error, :parse_failed_and}
        end

      "=" ->
        parsed_rest =
          query_string
          |> String.trim()
          |> String.trim_leading("=")
          |> String.trim()

        {:ok, "$.** ? (@ == #{parsed_rest})"}

      "~" ->
        parsed_rest =
          query_string
          |> String.trim()
          |> String.trim_leading("~")
          |> String.trim()

        {:ok, "$.** ? (@ like_regex #{parsed_rest})"} |> IO.inspect()

      _ ->
        {:error, :parse_failed}
    end
  end

  defp log_error({:error, _} = error, message) do
    Logger.error("#{message}: #{inspect(error)}")
    error
  end

  defp log_error(result, _), do: result

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
