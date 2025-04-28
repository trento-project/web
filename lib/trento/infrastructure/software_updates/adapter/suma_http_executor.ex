defmodule Trento.Infrastructure.SoftwareUpdates.Suma.HttpExecutor do
  require Logger

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

  defp request(method, url, body, headers, options) do
    # See https://hexdocs.pm/httpoison/HTTPoison.Request.html
    options = Keyword.put_new(options, :timeout, 8_000)
    options = Keyword.put_new(options, :recv_timeout, 5_000)
    options = Keyword.put_new(options, :attempt, 1)

    case HTTPoison.request(method, url, body, headers, options) do
      {:error, %HTTPoison.Error{reason: :timeout, id: _}} = timeout_error ->
        max_attempt = Keyword.get(options, :max_attempt, 3)
        current_attempt = Keyword.get(options, :attempt)

        Logger.info("#{Atom.to_string(method)} request to #{url} timed out. Retrying")

        if max_attempt == :infinity || current_attempt < max_attempt do
          options = Keyword.update!(options, :timeout, &(&1 * 2))
          options = Keyword.update!(options, :recv_timeout, &(&1 * 2))
          options = Keyword.update!(options, :attempt, &(&1 + 1))

          request(method, url, body, headers, options)
        else
          timeout_error
        end

      default ->
        default
    end
  end

  @impl true
  def login(base_url, username, password, ca_cert) do
    payload =
      Jason.encode!(%{
        "login" => username,
        "password" => password
      })

    request(
      :post,
      "#{base_url}/auth/login",
      payload,
      [{"Content-type", "application/json"}],
      ssl_options(ca_cert)
    )
  end

  @impl true
  def get_system_id(base_url, auth, fully_qualified_domain_name, ca_cert) do
    request(
      :get,
      "#{base_url}/system/getId",
      "",
      [{"Content-type", "application/json"}],
      [params: %{name: fully_qualified_domain_name}] ++ request_options(auth, ca_cert)
    )
  end

  @impl true
  def get_relevant_patches(base_url, auth, system_id, ca_cert) do
    request(
      :get,
      "#{base_url}/system/getRelevantErrata",
      "",
      [{"Content-type", "application/json"}],
      [params: %{sid: system_id}] ++ request_options(auth, ca_cert)
    )
  end

  @impl true
  def get_upgradable_packages(base_url, auth, system_id, ca_cert) do
    request(
      :get,
      "#{base_url}/system/listLatestUpgradablePackages",
      "",
      [{"Content-type", "application/json"}],
      [params: %{sid: system_id}] ++ request_options(auth, ca_cert)
    )
  end

  @impl true
  def get_errata_details(base_url, auth, advisory_name, ca_cert) do
    request(
      :get,
      "#{base_url}/errata/getDetails",
      "",
      [{"Content-type", "application/json"}],
      [params: %{"advisoryName" => advisory_name}] ++ request_options(auth, ca_cert)
    )
  end

  @impl true
  def get_affected_systems(base_url, auth, advisory_name, ca_cert) do
    request(
      :get,
      "#{base_url}/errata/listAffectedSystems",
      "",
      [{"Content-type", "application/json"}],
      [params: %{"advisoryName" => advisory_name}] ++ request_options(auth, ca_cert)
    )
  end

  @impl true
  def get_cves(base_url, auth, advisory_name, ca_cert) do
    request(
      :get,
      "#{base_url}/errata/listCves",
      "",
      [{"Content-type", "application/json"}],
      [params: %{"advisoryName" => advisory_name}] ++ request_options(auth, ca_cert)
    )
  end

  @impl true
  def get_affected_packages(base_url, auth, advisory_name, ca_cert) do
    request(
      :get,
      "#{base_url}/errata/listPackages",
      "",
      [{"Content-type", "application/json"}],
      [params: %{"advisoryName" => advisory_name}] ++ request_options(auth, ca_cert)
    )
  end

  @impl true
  def get_patches_for_package(base_url, auth, package_id, ca_cert) do
    request(
      :get,
      "#{base_url}/packages/listProvidingErrata",
      "",
      [{"Content-type", "application/json"}],
      [params: %{pid: String.to_integer(package_id)}] ++ request_options(auth, ca_cert)
    )
  end

  @impl true
  def get_bugzilla_fixes(base_url, auth, advisory_name, ca_cert) do
    request(
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
