defmodule Trento.Infrastructure.SoftwareUpdates.Suma do
  @moduledoc """
  SUMA Software updates discovery adapter
  """

  @behaviour Trento.SoftwareUpdates.Discovery.Gen

  alias Trento.Infrastructure.SoftwareUpdates.{Suma.State, SumaApi}
  alias Trento.Infrastructure.SoftwareUpdates.SumaApi
  alias Trento.SoftwareUpdates

  require Logger

  @auth_cache_key "suma_auth"

  @impl Trento.SoftwareUpdates.Discovery.Gen
  def setup do
    case setup_auth() do
      {:ok, _} ->
        :ok

      {:error, _} = error ->
        error
    end
  end

  @impl Trento.SoftwareUpdates.Discovery.Gen
  def clear do
    Cachex.del(:trento_cache, @auth_cache_key)

    :ok
  end

  @impl Trento.SoftwareUpdates.Discovery.Gen
  def get_system_id(fully_qualified_domain_name),
    do: call({:get_system_id, fully_qualified_domain_name})

  @impl Trento.SoftwareUpdates.Discovery.Gen
  def get_relevant_patches(system_id), do: call({:get_relevant_patches, system_id})

  @impl Trento.SoftwareUpdates.Discovery.Gen
  def get_upgradable_packages(system_id), do: call({:get_upgradable_packages, system_id})

  defp call(request) do
    case Cachex.get(:trento_cache, @auth_cache_key) do
      {:ok, nil} ->
        IO.inspect("Auth state is nil")
        authenticate_and_handle(request)

      {:ok, %State{} = auth_state} ->
        do_handle_with_auth_error(request, auth_state)
    end
  end

  defp do_handle_with_auth_error(request, state) do
    case handle_result = do_handle(request, state) do
      {:error, :authentication_error} ->
        authenticate_and_handle(request)

      _ ->
        handle_result
    end
  end

  defp authenticate_and_handle(request) do
    case setup_auth() do
      {:ok, state} ->
        do_handle(request, state)

      {:error, _} = error ->
        error
    end
  end

  defp setup_auth do
    with {:ok, %{url: url, username: username, password: password, ca_cert: ca_cert}} <-
           SoftwareUpdates.get_settings(),
         :ok <- write_ca_cert_file(ca_cert),
         {:ok, auth_cookie} <- SumaApi.login(url, username, password, ca_cert != nil) do
      state = %State{
        url: url,
        username: username,
        password: password,
        ca_cert: ca_cert,
        auth: auth_cookie,
        use_ca_cert: ca_cert != nil
      }

      result =
        Cachex.transaction(:trento_cache, [@auth_cache_key], fn cache ->
          case Cachex.put(cache, @auth_cache_key, state) do
            {:ok, true} -> {:ok, state}
            {:error, _} = error -> error
          end
        end)

      case result do
        {:ok, success_or_failure} -> success_or_failure
        {:error, _} = error -> error
      end

      {:ok, state}
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
