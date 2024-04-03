defmodule Trento.Infrastructure.SoftwareUpdates.Suma.HttpExecutor do
  @moduledoc """
  SUMA Http requests executor
  """

  alias Trento.Infrastructure.SoftwareUpdates.SumaApi

  @callback login(
              base_url :: String.t(),
              username :: String.t(),
              password :: String.t(),
              use_ca_cert :: boolean()
            ) ::
              {:ok, HTTPoison.Response.t()} | {:error, HTTPoison.Error.t()}

  @callback get_system_id(
              base_url :: String.t(),
              auth :: String.t(),
              fully_qualified_domain_name :: String.t(),
              use_ca_cert :: boolean()
            ) ::
              {:ok, HTTPoison.Response.t()} | {:error, HTTPoison.Error.t()}

  @callback get_relevant_patches(
              base_url :: String.t(),
              auth :: String.t(),
              system_id :: pos_integer(),
              use_ca_cert :: boolean()
            ) ::
              {:ok, HTTPoison.Response.t()} | {:error, HTTPoison.Error.t()}

  @callback get_upgradable_packages(
              base_url :: String.t(),
              auth :: String.t(),
              system_id :: pos_integer(),
              use_ca_cert :: boolean()
            ) ::
              {:ok, HTTPoison.Response.t()} | {:error, HTTPoison.Error.t()}

  @behaviour Trento.Infrastructure.SoftwareUpdates.Suma.HttpExecutor

  @impl true
  def login(base_url, username, password, use_ca_cert \\ false) do
    payload =
      Jason.encode!(%{
        "login" => username,
        "password" => password
      })

    HTTPoison.post(
      "#{base_url}/auth/login",
      payload,
      [{"Content-type", "application/json"}],
      ssl_options(use_ca_cert) ++ [timeout: 1_000]
    )
  end

  @impl true
  def get_system_id(base_url, auth, fully_qualified_domain_name, use_ca_cert \\ false) do
    HTTPoison.get(
      "#{base_url}/system/getId?name=#{fully_qualified_domain_name}",
      [{"Content-type", "application/json"}],
      hackney: [cookie: [auth]] ++ ssl_options(use_ca_cert)
    )
  end

  @impl true
  def get_relevant_patches(base_url, auth, system_id, use_ca_cert \\ false) do
    HTTPoison.get(
      "#{base_url}/system/getRelevantErrata?sid=#{system_id}",
      [{"Content-type", "application/json"}],
      hackney: [cookie: [auth]] ++ ssl_options(use_ca_cert)
    )
  end

  @impl true
  def get_upgradable_packages(base_url, auth, system_id, use_ca_cert \\ false) do
    HTTPoison.get(
      "#{base_url}/system/listLatestUpgradablePackages?sid=#{system_id}",
      [{"Content-type", "application/json"}],
      hackney: [cookie: [auth]] ++ ssl_options(use_ca_cert)
    )
  end

  defp ssl_options(true),
    do: [ssl: [verify: :verify_peer, cacertfile: SumaApi.ca_cert_path()]]

  defp ssl_options(_), do: []
end
