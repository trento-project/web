defmodule Trento.Infrastructure.SoftwareUpdates.Auth.SumaAuth do
  @moduledoc """
  GenServer module to authenticate with SUMA
  """

  @behaviour Trento.Infrastructure.SoftwareUpdates.Auth.Gen

  use GenServer, restart: :transient

  alias Trento.Infrastructure.SoftwareUpdates.Auth.State
  alias Trento.Infrastructure.SoftwareUpdates.SumaApi
  alias Trento.Settings

  @default_name "suma_authentication"

  def start_link([]), do: start_link(@default_name)

  def start_link(server_name),
    do: GenServer.start_link(__MODULE__, %State{}, name: process_identifier(server_name))

  @impl GenServer
  def init(%State{} = state), do: {:ok, state}

  def identify(server_name \\ @default_name),
    do:
      server_name
      |> identification_tuple
      |> :global.whereis_name()

  @impl Trento.Infrastructure.SoftwareUpdates.Auth.Gen
  def authenticate(server_name \\ @default_name),
    do:
      server_name
      |> process_identifier
      |> call(:authenticate)

  @impl Trento.Infrastructure.SoftwareUpdates.Auth.Gen
  def clear(server_name \\ @default_name),
    do:
      server_name
      |> process_identifier
      |> call(:clear)

  @impl GenServer
  def handle_call(:authenticate, _, %State{} = state) do
    case setup_auth(state) do
      {:ok, new_state} ->
        {:reply, {:ok, new_state}, new_state}

      {:error, _} = error ->
        {:reply, error, state}
    end
  end

  @impl GenServer
  def handle_call(:clear, _, _), do: {:reply, :ok, %State{}}

  @impl GenServer
  def format_status(_reason, [pdict, state]) do
    {:ok,
     [
       pdict,
       %{
         state
         | auth: "<REDACTED>",
           password: "<REDACTED>",
           ca_cert: "<REDACTED>"
       }
     ]}
  end

  defp call(server, request), do: GenServer.call(server, request, 15_000)

  defp process_identifier(server_name), do: {:global, identification_tuple(server_name)}

  defp identification_tuple(server_name), do: {__MODULE__, server_name}

  defp setup_auth(%State{auth: nil} = state) do
    with {:ok, %{url: url, username: username, password: password, ca_cert: ca_cert}} <-
           Settings.get_suse_manager_settings(),
         {:ok, auth_cookie} <- SumaApi.login(url, username, password, ca_cert) do
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

  defp setup_auth(%State{} = state), do: {:ok, state}
end
