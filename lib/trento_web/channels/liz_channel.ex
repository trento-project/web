defmodule TrentoWeb.LizChannel do
  @moduledoc false

  require Logger
  use TrentoWeb, :channel
  alias Trento.Users

  @impl true
  def join(
        "liz:" <> user_id,
        _payload,
        %{assigns: %{current_user_id: current_user_id}} = socket
      ) do
    if allowed?(user_id, current_user_id) do
      user = load_current_user(current_user_id)
      # most recent pat
      pat = "some_pat"

      Logger.warning(pat)

      case pat do
        nil ->
          Logger.error("Could not join liz channel, PAT is nil.")

          {:error, :unauthorized}

        some_pat ->
          Cachex.put(:liz, current_user_id, %{pat: some_pat})
          send(self(), :after_join)
          {:ok, assign(socket, :current_user, load_current_user(current_user_id))}
      end
    else
      Logger.error(
        "Could not join liz channel, requested user id: #{user_id}, authenticated user id: #{current_user_id}"
      )

      {:error, :unauthorized}
    end
  end

  def join("activity_log:" <> _user_id, _payload, _socket) do
    {:error, :user_not_logged}
  end

  @impl true
  def handle_info(
        :after_join,
        %{assigns: %{current_user_id: current_user_id}} = socket
      ) do
    {:ok, %{pat: pat}} = Cachex.get(:liz, current_user_id)

    {:ok, mcp_client_pid} =
      Trento.AI.MCP.start_link(
        transport:
          {:streamable_http,
           base_url: "http://localhost:5000", headers: %{"Authorization" => pat}}
      )

    {:ok, updated_chain, string_response} = Trento.AI.Brain.exec_system_prompt()

    Cachex.get_and_update(:liz, current_user_id, fn val ->
      %{val | chain: updated_chain}
    end)

    push(socket, "liz_pushed", %{liz_response: "4222"})
    {:noreply, socket}
  end

  def handle_info(:after_join, socket), do: {:noreply, socket}

  def handle_in("user_prompt", payload, %{current_user_id: current_user_id} = socket) do
    %{chain: current_chain} = Cachex.get(:liz, current_user_id)

    {:ok, updated_chain, string_response} =
      Trento.AI.Brain.exec_user_prompt(payload, current_chain)

    Cachex.get_and_update(:liz, current_user_id, fn val ->
      %{val | chain: updated_chain}
    end)

    {:reply, string_response, socket}
  end

  defp allowed?(user_id, current_user_id), do: String.to_integer(user_id) == current_user_id

  defp load_current_user(user_id) do
    case Users.get_user(user_id) do
      {:ok, user} -> user
      _ -> nil
    end
  end
end
