defmodule Trento.Infrastructure.SoftwareUpdates.Suma do
  @moduledoc """
  SUMA Software updates discovery adapter
  """

  @behaviour Trento.SoftwareUpdates.Discovery.Gen

  use GenServer, restart: :transient

  alias Trento.Infrastructure.SoftwareUpdates.{Suma.State, SumaApi}
  alias Trento.Infrastructure.SoftwareUpdates.SumaApi
  alias Trento.SoftwareUpdates

  require Logger

  @default_name "suma"

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

  @impl Trento.SoftwareUpdates.Discovery.Gen
  def setup(server_name \\ @default_name),
    do:
      server_name
      |> process_identifier
      |> call(:setup)

  @impl Trento.SoftwareUpdates.Discovery.Gen
  def clear(server_name \\ @default_name),
    do:
      server_name
      |> process_identifier
      |> call(:clear)

  @impl Trento.SoftwareUpdates.Discovery.Gen
  def get_system_id(fully_qualified_domain_name, server_name \\ @default_name),
    do:
      server_name
      |> process_identifier
      |> call({:get_system_id, fully_qualified_domain_name})

  @impl Trento.SoftwareUpdates.Discovery.Gen
  def get_relevant_patches(system_id, server_name \\ @default_name),
    do:
      server_name
      |> process_identifier
      |> call({:get_relevant_patches, system_id})

  @impl Trento.SoftwareUpdates.Discovery.Gen
  def get_upgradable_packages(system_id, server_name \\ @default_name),
    do:
      server_name
      |> process_identifier
      |> call({:get_upgradable_packages, system_id})

  @impl GenServer
  def handle_call(:setup, _from, %State{} = state) do
    case setup_auth(state) do
      {:ok, new_state} ->
        {:reply, :ok, new_state}

      {:error, _} = error ->
        {:reply, error, state}
    end
  end

  @impl GenServer
  def handle_call(:clear, _, _), do: {:reply, :ok, %State{}}

  @impl GenServer
  def handle_call(request, _, %State{auth: nil} = state),
    do: authenticate_and_handle(request, state)

  @impl GenServer
  def handle_call(request, _, %State{} = state) do
    case handle_result = do_handle(request, state) do
      {:error, :authentication_error} ->
        authenticate_and_handle(request, state)

      _ ->
        {:reply, handle_result, state}
    end
  end

  defp call(server, request), do: GenServer.call(server, request, 10_000)

  defp authenticate_and_handle(request, state) do
    case setup_auth(state) do
      {:ok, new_state} ->
        {:reply, do_handle(request, new_state), new_state}

      {:error, _} = error ->
        {:reply, error, state}
    end
  end

  defp do_handle({:get_system_id, fully_qualified_domain_name}, %State{
         url: url,
         auth: auth_cookie,
         use_ca_cert: use_ca_cert
       }),
       do: SumaApi.get_system_id(url, auth_cookie, fully_qualified_domain_name, use_ca_cert)

  defp do_handle({:get_relevant_patches, system_id}, %State{
         url: url,
         auth: auth_cookie,
         use_ca_cert: use_ca_cert
       }),
       do: SumaApi.get_relevant_patches(url, auth_cookie, system_id, use_ca_cert)

  defp do_handle({:get_upgradable_packages, system_id}, %State{
         url: url,
         auth: auth_cookie,
         use_ca_cert: use_ca_cert
       }),
       do: SumaApi.get_upgradable_packages(url, auth_cookie, system_id, use_ca_cert)

  defp process_identifier(server_name), do: {:global, identification_tuple(server_name)}

  defp identification_tuple(server_name), do: {__MODULE__, server_name}

  defp setup_auth(%State{} = state) do
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
