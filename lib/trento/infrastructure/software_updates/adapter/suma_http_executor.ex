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

  @behaviour Trento.Infrastructure.SoftwareUpdates.Suma.HttpExecutor

  @impl true
  def login(base_url, username, password, ca_cert \\ nil) do
    payload =
      Jason.encode!(%{
        "login" => username,
        "password" => password
      })

    HTTPoison.post(
      "#{base_url}/auth/login",
      payload,
      [{"Content-type", "application/json"}],
      ssl_options(ca_cert) ++ timeout_options()
    )
  end

  @impl true
  def get_system_id(base_url, auth, fully_qualified_domain_name, ca_cert \\ nil) do
    HTTPoison.get(
      "#{base_url}/system/getId?name=#{fully_qualified_domain_name}",
      [{"Content-type", "application/json"}],
      request_options(auth, ca_cert)
    )
  end

  @impl true
  def get_relevant_patches(base_url, auth, system_id, ca_cert \\ nil) do
    HTTPoison.get(
      "#{base_url}/system/getRelevantErrata?sid=#{system_id}",
      [{"Content-type", "application/json"}],
      request_options(auth, ca_cert)
    )
  end

  @impl true
  def get_upgradable_packages(base_url, auth, system_id, ca_cert \\ nil) do
    HTTPoison.get(
      "#{base_url}/system/listLatestUpgradablePackages?sid=#{system_id}",
      [{"Content-type", "application/json"}],
      request_options(auth, ca_cert)
    )
  end

  defp request_options(auth, ca_cert),
    do: [hackney: [cookie: [auth]]] ++ ssl_options(ca_cert) ++ timeout_options()

  defp timeout_options, do: [timeout: 1_000, recv_timeout: 1_500]

  defp ssl_options(nil), do: []

  defp ssl_options(ca_cert),
    do: [ssl: [verify: :verify_peer, cacerts: [get_cert_der(ca_cert)]]]

  def get_cert_der(ca_cert) do
    {cert_type, cert_entry} =
      ca_cert
      |> :public_key.pem_decode()
      |> hd()
      |> :public_key.pem_entry_decode()
      |> split_type_and_entry()

    :public_key.der_encode(cert_type, cert_entry)
  end

  def split_type_and_entry(ans1_entry) do
    ans1_type = elem(ans1_entry, 0)
    {ans1_type, ans1_entry}
  end
end
