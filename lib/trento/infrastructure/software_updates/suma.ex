defmodule Trento.Infrastructure.SoftwareUpdates.Suma do
  @moduledoc """
  SUMA Software updates discovery adapter
  """

  @behaviour Trento.SoftwareUpdates.Discovery.Gen

  alias Trento.Infrastructure.SoftwareUpdates.Auth.State
  alias Trento.Infrastructure.SoftwareUpdates.SumaApi

  @impl Trento.SoftwareUpdates.Discovery.Gen
  def setup do
    case auth().authenticate() do
      {:error, _} = error ->
        error

      {:ok, _} ->
        :ok
    end
  end

  @impl Trento.SoftwareUpdates.Discovery.Gen
  def clear, do: auth().clear()

  @impl Trento.SoftwareUpdates.Discovery.Gen
  def get_system_id(fully_qualified_domain_name),
    do: handle_request({:get_system_id, fully_qualified_domain_name})

  @impl Trento.SoftwareUpdates.Discovery.Gen
  def get_relevant_patches(system_id),
    do: handle_request({:get_relevant_patches, system_id})

  @impl Trento.SoftwareUpdates.Discovery.Gen
  def get_upgradable_packages(system_id),
    do: handle_request({:get_upgradable_packages, system_id})

  @impl Trento.SoftwareUpdates.Discovery.Gen
  def get_patches_for_package(package_id),
    do: handle_request({:get_patches_for_package, package_id})

  @impl Trento.SoftwareUpdates.Discovery.Gen
  def get_errata_details(advisory_name),
    do: handle_request({:get_errata_details, advisory_name})

  @impl Trento.SoftwareUpdates.Discovery.Gen
  def get_affected_systems(advisory_name),
    do: handle_request({:get_affected_systems, advisory_name})

  @impl Trento.SoftwareUpdates.Discovery.Gen
  def get_cves(advisory_name),
    do: handle_request({:get_cves, advisory_name})

  @impl Trento.SoftwareUpdates.Discovery.Gen
  def get_affected_packages(advisory_name),
    do: handle_request({:get_affected_packages, advisory_name})

  defp handle_request(request) do
    case auth().authenticate() do
      {:ok, new_state} ->
        request
        |> do_handle(new_state)
        |> handle_authentication_error(request)

      error ->
        error
    end
  end

  defp handle_authentication_error({:error, :authentication_error}, request) do
    clear()
    handle_request(request)
  end

  defp handle_authentication_error(result, _), do: result

  defp do_handle({:get_system_id, fully_qualified_domain_name}, %State{
         url: url,
         auth: auth_cookie,
         ca_cert: ca_cert
       }),
       do: SumaApi.get_system_id(url, auth_cookie, fully_qualified_domain_name, ca_cert)

  defp do_handle({:get_relevant_patches, system_id}, %State{
         url: url,
         auth: auth_cookie,
         ca_cert: ca_cert
       }),
       do: SumaApi.get_relevant_patches(url, auth_cookie, system_id, ca_cert)

  defp do_handle({:get_upgradable_packages, system_id}, %State{
         url: url,
         auth: auth_cookie,
         ca_cert: ca_cert
       }),
       do: SumaApi.get_upgradable_packages(url, auth_cookie, system_id, ca_cert)

  defp do_handle({:get_patches_for_package, package_id}, %State{
         url: url,
         auth: auth_cookie,
         ca_cert: ca_cert
       }),
       do: SumaApi.get_patches_for_package(url, auth_cookie, package_id, ca_cert)

  defp do_handle({:get_errata_details, advisory_name}, %State{
         url: url,
         auth: auth_cookie,
         ca_cert: ca_cert
       }),
       do: SumaApi.get_errata_details(url, auth_cookie, advisory_name, ca_cert)

  defp do_handle({:get_affected_systems, advisory_name}, %State{
         url: url,
         auth: auth_cookie,
         ca_cert: ca_cert
       }),
       do: SumaApi.get_affected_systems(url, auth_cookie, advisory_name, ca_cert)

  defp do_handle({:get_cves, advisory_name}, %State{
         url: url,
         auth: auth_cookie,
         ca_cert: ca_cert
       }),
       do: SumaApi.get_cves(url, auth_cookie, advisory_name, ca_cert)

  defp do_handle({:get_affected_packages, advisory_name}, %State{
         url: url,
         auth: auth_cookie,
         ca_cert: ca_cert
       }),
       do: SumaApi.get_affected_packages(url, auth_cookie, advisory_name, ca_cert)

  defp auth, do: Application.fetch_env!(:trento, __MODULE__)[:auth]
end
