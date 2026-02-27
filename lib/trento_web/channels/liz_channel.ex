defmodule TrentoWeb.LizChannel do
  @moduledoc false

  require Logger
  use TrentoWeb, :channel
  alias Trento.Users
  alias TrentoWeb.Auth.PersonalAccessToken
  alias Trento.PersonalAccessTokens

  @impl true
  def join(
        "liz:" <> user_id,
        %{"assistant_session_id" => assistant_session_id},
        %{assigns: %{current_user_id: current_user_id}} = socket
      )
      when is_binary(assistant_session_id) and byte_size(assistant_session_id) > 0 do
    if allowed?(user_id, current_user_id) do
      user = load_current_user(current_user_id)
      cache_key = state_key(current_user_id, assistant_session_id)
      existing_state = load_cached_state(cache_key)

      case resolve_plain_pat(current_user_id, user) do
        {:ok, plain_pat} ->
          Cachex.put(
            :liz,
            cache_key,
            Map.merge(existing_state, %{
              pat: plain_pat,
              channel_pid: self(),
              user_id: current_user_id,
              assistant_session_id: assistant_session_id
            })
          )

          {:ok,
           socket
           |> assign(:current_user, user)
           |> assign(:assistant_session_id, assistant_session_id)
           |> assign(:liz_cache_key, cache_key)}

        {:error, reason} ->
          Logger.error("Could not resolve personal access token: #{inspect(reason)}")
          {:error, :unauthorized}
      end
    else
      Logger.error(
        "Could not join liz channel, requested user id: #{user_id}, authenticated user id: #{current_user_id}"
      )

      {:error, :unauthorized}
    end
  end

  def join("liz:" <> _user_id, _payload, %{assigns: %{current_user_id: _current_user_id}}) do
    {:error, :missing_assistant_session_id}
  end

  def join("liz:" <> _user_id, _payload, _socket) do
    {:error, :user_not_logged}
  end

  @impl true
  def handle_in("user_prompt", payload, %{assigns: %{liz_cache_key: cache_key}} = socket) do
    message = payload["message"]
    context = payload["context"] || %{}

    case get_session_state(cache_key) do
      {:ok, state} ->
        handle_user_prompt(socket, cache_key, state, message, context)

      {:error, reason} ->
        Logger.error("Could not load liz session #{cache_key}: #{inspect(reason)}")
        {:reply, {:error, %{reason: "assistant_session_not_initialized"}}, socket}
    end
  end

  @impl true
  def terminate(_reason, %{assigns: %{liz_cache_key: cache_key}}) do
    cleanup_session(cache_key, self())
    :ok
  end

  def terminate(_reason, _socket), do: :ok

  defp handle_user_prompt(socket, _cache_key, _state, message, _context)
       when message in [nil, ""] do
    {:reply, {:error, %{reason: "empty_message"}}, socket}
  end

  defp handle_user_prompt(socket, cache_key, state, message, context) do
    case state[:chain] do
      nil ->
        with {:ok, %{client_ref: mcp_client_ref, supervisor_pid: mcp_supervisor_pid}} <-
               ensure_mcp_client(cache_key, state),
             {:ok, updated_chain} <- Trento.AI.Brain.exec_system_prompt(mcp_client_ref),
             {:ok, final_chain, string_response} <-
               Trento.AI.Brain.exec_user_prompt(message, updated_chain, context) do
          put_session_state(
            cache_key,
            Map.merge(state, %{
              chain: final_chain,
              mcp_client_ref: mcp_client_ref,
              mcp_supervisor_pid: mcp_supervisor_pid,
              user_id: state[:user_id],
              channel_pid: self()
            })
          )

          {:reply, {:ok, string_response}, socket}
        else
          {:error, reason} ->
            Logger.error("Could not process liz prompt for #{cache_key}: #{inspect(reason)}")
            {:reply, {:error, %{reason: "assistant_request_failed"}}, socket}
        end

      current_chain ->
        case Trento.AI.Brain.exec_user_prompt(message, current_chain, context) do
          {:ok, updated_chain, string_response} ->
            put_session_state(
              cache_key,
              Map.merge(state, %{chain: updated_chain, channel_pid: self()})
            )

            {:reply, {:ok, string_response}, socket}

          {:error, reason} ->
            Logger.error("Could not process liz prompt for #{cache_key}: #{inspect(reason)}")
            {:reply, {:error, %{reason: "assistant_request_failed"}}, socket}
        end
    end
  end

  defp get_session_state(cache_key) do
    case Cachex.get(:liz, cache_key) do
      {:ok, nil} -> {:error, :session_not_found}
      {:ok, state} -> {:ok, state}
      {:error, reason} -> {:error, reason}
    end
  end

  defp put_session_state(cache_key, state) do
    Cachex.put(:liz, cache_key, state)
  end

  defp load_cached_state(cache_key) do
    case Cachex.get(:liz, cache_key) do
      {:ok, state} when is_map(state) -> state
      _ -> %{}
    end
  end

  defp resolve_plain_pat(_user_id, nil), do: {:error, :user_not_found}

  defp resolve_plain_pat(user_id, user) do
    case Cachex.get(:liz, pat_cache_key(user_id)) do
      {:ok, %{pat: cached_pat}} when is_binary(cached_pat) and byte_size(cached_pat) > 0 ->
        case PersonalAccessTokens.validate(cached_pat) do
          {:ok, _pat} ->
            {:ok, cached_pat}

          _ ->
            create_plain_pat(user_id, user)
        end

      _ ->
        create_plain_pat(user_id, user)
    end
  end

  defp create_plain_pat(user_id, user) do
    plain_pat = PersonalAccessToken.generate()
    now = DateTime.utc_now()
    expires_at = DateTime.add(now, 2, :hour)
    attrs = %{name: "liz_autogen_#{now}", token: plain_pat, expires_at: expires_at}

    case PersonalAccessTokens.create_personal_access_token(user, attrs) do
      {:ok, _pat} ->
        Cachex.put(:liz, pat_cache_key(user_id), %{pat: plain_pat})
        {:ok, plain_pat}

      {:error, reason} ->
        {:error, reason}
    end
  end

  defp pat_cache_key(user_id), do: "pat:#{user_id}"

  defp fetch_pat(%{pat: pat}) when is_binary(pat) and byte_size(pat) > 0, do: {:ok, pat}
  defp fetch_pat(_state), do: {:error, :missing_pat}

  defp ensure_mcp_client(_cache_key, state) do
    user_id = state[:user_id]
    client_ref = mcp_client_ref(user_id)
    supervisor_pid = state[:mcp_supervisor_pid]

    cond do
      client_alive?(client_ref) and is_pid(supervisor_pid) and Process.alive?(supervisor_pid) ->
        {:ok, %{client_ref: client_ref, supervisor_pid: supervisor_pid}}

      client_alive?(client_ref) ->
        {:ok, %{client_ref: client_ref, supervisor_pid: nil}}

      true ->
        with {:ok, pat} <- fetch_pat(state),
             {:ok, mcp_client} <- start_mcp_client(user_id, pat) do
          {:ok, mcp_client}
        end
    end
  end

  defp start_mcp_client(user_id, pat) do
    client_ref = mcp_client_ref(user_id)
    transport_name = {:via, Registry, {Trento.AI.Registry, {:liz_mcp_transport, user_id}}}

    case Trento.AI.MCP.start_link(
           client_name: client_ref,
           transport_name: transport_name,
           client_info: mcp_client_info(user_id),
           transport:
             {:streamable_http, base_url: mcp_base_url(), headers: %{"Authorization" => pat}}
         ) do
      {:ok, supervisor_pid} ->
        {:ok, %{client_ref: client_ref, supervisor_pid: supervisor_pid}}

      {:error, {:already_started, supervisor_pid}} ->
        {:ok, %{client_ref: client_ref, supervisor_pid: supervisor_pid}}

      {:error, reason} ->
        {:error, reason}
    end
  end

  defp mcp_client_ref(user_id),
    do: {:via, Registry, {Trento.AI.Registry, {:liz_mcp_client, user_id}}}

  defp mcp_client_info(user_id) do
    %{
      "name" => "TrentoMCPUser#{user_id}",
      "version" => "1.0.0"
    }
  end

  defp client_alive?(client_ref), do: GenServer.whereis(client_ref) != nil

  defp mcp_base_url do
    case Application.get_env(:trento, :ai_assistant_ws_url) do
      url when is_binary(url) and byte_size(url) > 0 -> url
      _ -> "http://localhost:5000"
    end
  end

  defp cleanup_session(cache_key, channel_pid) do
    case Cachex.get(:liz, cache_key) do
      {:ok, %{channel_pid: ^channel_pid}} ->
        Cachex.del(:liz, cache_key)
        :ok

      _ ->
        :ok
    end
  end

  defp state_key(current_user_id, assistant_session_id),
    do: "#{current_user_id}:#{assistant_session_id}"

  defp allowed?(user_id, current_user_id), do: String.to_integer(user_id) == current_user_id

  defp load_current_user(user_id) do
    case Users.get_user(user_id) do
      {:ok, user} -> user
      _ -> nil
    end
  end
end
