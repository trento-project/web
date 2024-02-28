defmodule Trento.Infrastructure.SoftwareUpdates.Suma do
  @moduledoc """
  SUMA Software updates discovery adapter
  """

  @behaviour Trento.SoftwareUpdates.Discovery.Gen

  use GenServer, restart: :transient

  alias Trento.Infrastructure.SoftwareUpdates.{Suma.State, SumaApi}
  alias Trento.SoftwareUpdates

  require Logger

  @default_name "suma"

  def start_link([]), do: start_link(@default_name)

  def start_link(server_name),
    do: GenServer.start_link(__MODULE__, %State{}, name: process_identifier(server_name))

  @impl true
  def init(%State{} = state), do: {:ok, state}

  def identify(server_name \\ @default_name),
    do:
      server_name
      |> identificaton_tuple
      |> :global.whereis_name()

  def setup(server_name \\ @default_name),
    do:
      server_name
      |> process_identifier
      |> GenServer.call(:setup)

  @impl true
  def get_system_id(fully_qualified_domain_name, server_name \\ @default_name),
    do:
      server_name
      |> process_identifier
      |> GenServer.call({:get_system_id, fully_qualified_domain_name})

  @impl true
  def handle_call(:setup, _from, %State{} = state) do
    case setup_auth(state) do
      {:ok, new_state} ->
        {:reply, :ok, new_state}

      {:error, _} = error ->
        {:reply, error, state}
    end
  end

  @impl true
  def handle_call(request, from, %State{auth: nil} = state),
    do: {:noreply, state, {:continue, {:setup, from, request}}}

  @impl true
  def handle_call(
        {:get_system_id, fully_qualified_domain_name},
        _from,
        %{
          url: url,
          auth: auth_cookie
        } = state
      ) do
    {:reply, SumaApi.get_system_id(url, auth_cookie, fully_qualified_domain_name), state}
  end

  @impl true
  def handle_continue({:setup, from, previous_message}, %State{} = state) do
    case setup_auth(state) do
      {:ok, new_state} ->
        Process.send(self(), {previous_message, reply_to: from}, [:nosuspend, :noconnect])
        {:noreply, new_state}

      {:error, reason} ->
        {:stop, reason}
    end
  end

  @impl true
  def handle_info(
        {{:get_system_id, fully_qualified_domain_name}, reply_to: from},
        %State{
          url: url,
          auth: auth_cookie
        } = state
      ) do
    GenServer.reply(from, SumaApi.get_system_id(url, auth_cookie, fully_qualified_domain_name))

    {:noreply, state}
  end

  defp process_identifier(server_name), do: {:global, identificaton_tuple(server_name)}

  defp identificaton_tuple(server_name), do: {__MODULE__, server_name}

  defp setup_auth(%State{} = state) do
    with {:ok, %{url: url, username: username, password: password, ca_cert: ca_cert}} <-
           SoftwareUpdates.get_settings(),
         {:ok, auth_cookie} <- SumaApi.login(url, username, password) do
      {:ok,
       %State{
         state
         | url: url,
           username: username,
           password: password,
           ca_cert: ca_cert,
           auth: auth_cookie
       }}
    end
  end
end
