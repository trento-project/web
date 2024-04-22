defmodule Trento.Infrastructure.SoftwareUpdates.Auth.SumaAuth do
  @moduledoc """
  GenServer module to authenticate with SUMA
  """

  @behaviour Trento.Infrastructure.SoftwareUpdates.Auth.Gen

  use GenServer, restart: :transient

  alias Trento.Infrastructure.SoftwareUpdates.{Suma.State, SumaApi}
  alias Trento.Infrastructure.SoftwareUpdates.SumaApi
  alias Trento.SoftwareUpdates

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
           SoftwareUpdates.get_settings(),
         :ok <- write_ca_cert_file(ca_cert),
         {:ok, auth_cookie} <- SumaApi.login(url, username, password, ca_cert != nil) do
      {:ok,
       %State{
         state
         | url: url,
           username: username,
           password: password,
           ca_cert: ca_cert,
           auth: auth_cookie,
           use_ca_cert: ca_cert != nil
       }}
    end
  end

  defp setup_auth(%State{} = state), do: {:ok, state}

  defp write_ca_cert_file(nil) do
    case File.rm_rf(SumaApi.ca_cert_path()) do
      {:ok, _} -> :ok
      _ -> :error
    end
  end

  defp write_ca_cert_file(ca_cert) do
    SumaApi.ca_cert_path()
    |> Path.dirname()
    |> File.mkdir_p!()

    File.write(SumaApi.ca_cert_path(), ca_cert)
  end
end
