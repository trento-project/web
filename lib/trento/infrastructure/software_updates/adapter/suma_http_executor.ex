defmodule Trento.Infrastructure.SoftwareUpdates.Suma.HttpExecutor do
  @moduledoc """
  SUMA Http requests executor
  """

  @callback login(
              base_url :: String.t(),
              username :: String.t(),
              password :: String.t(),
              ca_cert :: String.t() | nil
            ) ::
              {:ok, HTTPoison.Response.t()} | {:error, HTTPoison.Error.t()}

  @callback get_system_id(
              base_url :: String.t(),
              auth :: String.t(),
              fully_qualified_domain_name :: String.t(),
              ca_cert :: String.t() | nil
            ) ::
              {:ok, HTTPoison.Response.t()} | {:error, HTTPoison.Error.t()}

  @callback get_relevant_patches(
              base_url :: String.t(),
              auth :: String.t(),
              system_id :: pos_integer(),
              ca_cert :: String.t() | nil
            ) ::
              {:ok, HTTPoison.Response.t()} | {:error, HTTPoison.Error.t()}

  @callback get_upgradable_packages(
              base_url :: String.t(),
              auth :: String.t(),
              system_id :: pos_integer(),
              ca_cert :: String.t() | nil
            ) ::
              {:ok, HTTPoison.Response.t()} | {:error, HTTPoison.Error.t()}

  @callback get_errata_details(
              base_url :: String.t(),
              auth :: String.t(),
              advisory_name :: String.t(),
              ca_cert :: String.t() | nil
            ) ::
              {:ok, HTTPoison.Response.t()} | {:error, HTTPoison.Error.t()}

  @callback get_affected_systems(
              base_url :: String.t(),
              auth :: String.t(),
              advisory_name :: String.t(),
              ca_cert :: String.t() | nil
            ) ::
              {:ok, HTTPoison.Response.t()} | {:error, HTTPoison.Error.t()}

  @callback get_cves(
              base_url :: String.t(),
              auth :: String.t(),
              advisory_name :: String.t(),
              ca_cert :: String.t() | nil
            ) ::
              {:ok, HTTPoison.Response.t()} | {:error, HTTPoison.Error.t()}

  @callback get_affected_packages(
              base_url :: String.t(),
              auth :: String.t(),
              advisory_name :: String.t(),
              ca_cert :: String.t() | nil
            ) ::
              {:ok, HTTPoison.Response.t()} | {:error, HTTPoison.Error.t()}

  @callback get_patches_for_package(
              base_url :: String.t(),
              auth :: String.t(),
              package_id :: String.t(),
              ca_cert :: String.t() | nil
            ) ::
              {:ok, HTTPoison.Response.t()} | {:error, HTTPoison.Error.t()}

  @callback get_bugzilla_fixes(
              base_url :: String.t(),
              auth :: String.t(),
              advisory_name :: String.t(),
              ca_cert :: String.t() | nil
            ) ::
              {:ok, HTTPoison.Response.t()} | {:error, HTTPoison.Error.t()}

  @behaviour Trento.Infrastructure.SoftwareUpdates.Suma.HttpExecutor

  @impl true
  def login(base_url, username, password, ca_cert) do
    payload =
      Jason.encode!(%{
        "login" => username,
        "password" => password
      })

    HTTPoison.post(
      "#{base_url}/auth/login",
      payload,
      [{"Content-type", "application/json"}],
      ssl_options(ca_cert)
    )
  end

  @impl true
  def get_system_id(base_url, auth, fully_qualified_domain_name, ca_cert) do
    HTTPoison.request(
      :get,
      "#{base_url}/system/getId",
      "",
      [{"Content-type", "application/json"}],
      [params: %{name: fully_qualified_domain_name}] ++ request_options(auth, ca_cert)
    )
  end

  @impl true
  def get_relevant_patches(base_url, auth, system_id, ca_cert) do
    HTTPoison.request(
      :get,
      "#{base_url}/system/getRelevantErrata",
      "",
      [{"Content-type", "application/json"}],
      [params: %{sid: system_id}] ++ request_options(auth, ca_cert)
    )
  end

  @impl true
  def get_upgradable_packages(base_url, auth, system_id, ca_cert) do
    HTTPoison.request(
      :get,
      "#{base_url}/system/listLatestUpgradablePackages",
      "",
      [{"Content-type", "application/json"}],
      [params: %{sid: system_id}] ++ request_options(auth, ca_cert)
    )
  end

  @impl true
  def get_errata_details(base_url, auth, advisory_name, ca_cert) do
    HTTPoison.request(
      :get,
      "#{base_url}/errata/getDetails",
      "",
      [{"Content-type", "application/json"}],
      [params: %{"advisoryName" => advisory_name}] ++ request_options(auth, ca_cert)
    )
  end

  @impl true
  def get_affected_systems(base_url, auth, advisory_name, ca_cert) do
    HTTPoison.request(
      :get,
      "#{base_url}/errata/listAffectedSystems",
      "",
      [{"Content-type", "application/json"}],
      [params: %{"advisoryName" => advisory_name}] ++ request_options(auth, ca_cert)
    )
  end

  @impl true
  def get_cves(base_url, auth, advisory_name, ca_cert) do
    HTTPoison.request(
      :get,
      "#{base_url}/errata/listCves",
      "",
      [{"Content-type", "application/json"}],
      [params: %{"advisoryName" => advisory_name}] ++ request_options(auth, ca_cert)
    )
  end

  @impl true
  def get_affected_packages(base_url, auth, advisory_name, ca_cert) do
    HTTPoison.request(
      :get,
      "#{base_url}/errata/listPackages",
      "",
      [{"Content-type", "application/json"}],
      [params: %{"advisoryName" => advisory_name}] ++ request_options(auth, ca_cert)
    )
  end

  @impl true
  def get_patches_for_package(base_url, auth, package_id, ca_cert) do
    HTTPoison.request(
      :get,
      "#{base_url}/packages/listProvidingErrata",
      "",
      [{"Content-type", "application/json"}],
      [params: %{pid: String.to_integer(package_id)}] ++ request_options(auth, ca_cert)
    )
  end

  @impl true
  def get_bugzilla_fixes(base_url, auth, advisory_name, ca_cert) do
    HTTPoison.request(
      :post,
      "#{base_url}/errata/bugzillaFixes",
      "",
      [{"Content-type", "application/json"}],
      [params: %{"advisoryName" => advisory_name}] ++ request_options(auth, ca_cert)
    )
  end

  def get_cert_der(ca_cert) do
    ca_cert
    |> :public_key.pem_decode()
    |> Enum.map(&:public_key.pem_entry_decode/1)
    |> Enum.map(fn {asn1_type, _, _, _} = asn1_entry ->
      :public_key.der_encode(asn1_type, asn1_entry)
    end)
  end

  defp request_options(auth, ca_cert),
    do: [hackney: [cookie: [auth]]] ++ ssl_options(ca_cert)

  defp ssl_options(nil), do: []

  defp ssl_options(ca_cert),
    do: [ssl: [verify: :verify_peer, cacerts: get_cert_der(ca_cert)]]
end
