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
        _payload,
        %{assigns: %{current_user_id: current_user_id}} = socket
      ) do
    if allowed?(user_id, current_user_id) do
      user = load_current_user(current_user_id)
      plain_pat = PersonalAccessToken.generate()
      now = DateTime.utc_now()
      expires_at = DateTime.add(now, 2, :hour)
      attrs = %{name: "liz_autogen_#{now}", token: plain_pat, expires_at: expires_at}

      Logger.warning(plain_pat)

      case PersonalAccessTokens.load(plain_pat) do
        pat when not is_nil(pat) ->
          Cachex.put(:liz, current_user_id, %{pat: plain_pat})
          send(self(), :after_join)
          {:ok, assign(socket, :current_user, load_current_user(current_user_id))}

        nil ->
          case PersonalAccessTokens.create_personal_access_token(user, attrs) do
            {:error, reason} ->
              Logger.error(inspect(reason))
              {:error, :unauthorized}

            {:ok, pat} ->
              Cachex.put(:liz, current_user_id, %{pat: plain_pat})
              send(self(), :after_join)
              {:ok, assign(socket, :current_user, load_current_user(current_user_id))}
          end
      end
    else
      Logger.error(
        "Could not join liz channel, requested user id: #{user_id}, authenticated user id: #{current_user_id}"
      )

      {:error, :unauthorized}
    end
  end

  def join("liz:" <> _user_id, _payload, _socket) do
    {:error, :user_not_logged}
  end

  @impl true
  def handle_info(
        :after_join,
        %{assigns: %{current_user_id: current_user_id}} = socket
      ) do
    Logger.warning("after_join")
    {:ok, %{pat: pat}} = Cachex.get(:liz, current_user_id)

    {:ok, mcp_client_pid} =
      Trento.AI.MCP.start_link(
        transport:
          {:streamable_http,
           base_url: "http://localhost:5000", headers: %{"Authorization" => "Bearer #{pat}"}}
      )

    {:ok, updated_chain, string_response} = Trento.AI.Brain.exec_system_prompt()

    Cachex.get_and_update(:liz, current_user_id, fn val ->
      Map.merge(val, %{chain: updated_chain})
    end)

    push(socket, "liz_pushed", %{liz_response: "4222"})
    {:noreply, socket}
  end

  def handle_info(:after_join, socket), do: {:noreply, socket}

  def handle_in("user_prompt", payload, socket) do
    Logger.warning(inspect(payload))
    current_user_id = 1
    {:ok, state} = Cachex.get(:liz, current_user_id)

    case state[:chain] do
      nil ->
        Logger.warning("branch nil chain")
        {:ok, updated_chain, string_response} = Trento.AI.Brain.exec_system_prompt()

        Cachex.get_and_update(:liz, current_user_id, fn val ->
          Map.merge(val, %{chain: updated_chain})
        end)

        {:reply, {:ok, string_response}, socket}

      current_chain ->
        Logger.warning("branch not nil chain")
        {:ok, updated_chain, string_response} = Trento.AI.Brain.exec_system_prompt()

        {:ok, updated_chain, {:ok, string_response}} =
          Trento.AI.Brain.exec_user_prompt(payload, current_chain)

        Cachex.get_and_update(:liz, current_user_id, fn val ->
          Map.merge(val, %{chain: updated_chain})
        end)

        {:reply, {:ok, string_response}, socket}
    end
  end

  defp allowed?(user_id, current_user_id), do: String.to_integer(user_id) == current_user_id

  defp load_current_user(user_id) do
    case Users.get_user(user_id) do
      {:ok, user} -> user
      _ -> nil
    end
  end
end
