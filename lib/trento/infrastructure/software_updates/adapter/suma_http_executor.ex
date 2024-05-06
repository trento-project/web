defmodule Trento.Infrastructure.SoftwareUpdates.Suma.HttpExecutor do
  @moduledoc """
  SUMA Http requests executor
  """

  alias Trento.Infrastructure.SoftwareUpdates.SumaApi

  @callback login(
              base_url :: String.t(),
              username :: String.t(),
              password :: String.t(),
              ca_cert :: String.t() | nil
            ) ::
              {:ok, Finch.Response.t()} | {:error, Exception.t()}

  @callback get_system_id(
              base_url :: String.t(),
              auth :: String.t(),
              fully_qualified_domain_name :: String.t(),
              ca_cert :: String.t() | nil
            ) ::
              {:ok, Finch.Response.t()} | {:error, Exception.t()}

  @callback get_relevant_patches(
              base_url :: String.t(),
              auth :: String.t(),
              system_id :: pos_integer(),
              ca_cert :: String.t() | nil
            ) ::
              {:ok, Finch.Response.t()} | {:error, Exception.t()}

  @callback get_upgradable_packages(
              base_url :: String.t(),
              auth :: String.t(),
              system_id :: pos_integer(),
              ca_cert :: String.t() | nil
            ) ::
              {:ok, Finch.Response.t()} | {:error, Exception.t()}

  @behaviour Trento.Infrastructure.SoftwareUpdates.Suma.HttpExecutor

  @impl true
  def login(base_url, username, password, ca_cert \\ nil) do
    payload =
      Jason.encode!(%{
        "login" => username,
        "password" => password
      })

    start_finch(ca_cert)

    Finch.build(
      :post,
      "#{base_url}/auth/login",
      [{"Content-type", "application/json"}],
      payload
    )
    |> Finch.request(Trento.Finch)
  end

  def start_finch(ca_cert) do
    transport_options =
      case ca_cert do
        nil ->
          IO.puts("No CA cert provided")
          [
            {:verify, :verify_peer},
            {:versions, [:"tlsv1.3"]},
          ]

        _ ->
          IO.puts("CA cert provided")
          [
            {:verify, :verify_peer},
            {:cacerts, [get_cert_der(ca_cert)]},
            {:keep_secrets, true},
            {:versions, [:"tlsv1.3"]},
            {:log_level, :debug}
          ]
      end

    Finch.start_link(
      name: Trento.Finch,
      pools: %{
        default: [
          conn_opts: [
            transport_opts: transport_options,
            ssl_key_log_file: "/tmp/trento-ssl.log"
          ]
        ]
      }
    )
  end

  @impl true
  def get_system_id(base_url, auth, fully_qualified_domain_name, ca_cert \\ nil) do
    start_finch(ca_cert)

    Finch.build(
      :get,
      "#{base_url}/system/getId?name=#{fully_qualified_domain_name}",
      request_headers(auth)
    )
    |> Finch.request(Trento.Finch)
  end

  @impl true
  def get_relevant_patches(base_url, auth, system_id, ca_cert \\ nil) do
    start_finch(ca_cert)

    Finch.build(
      :get,
      "#{base_url}/system/getRelevantErrata?sid=#{system_id}",
      request_headers(auth)
    )
    |> Finch.request(Trento.Finch)
  end

  defp request_headers(auth),
    do: [
      {"Content-type", "application/json"},
      {"Cookie", auth}
    ]

  @impl true
  def get_upgradable_packages(base_url, auth, system_id, ca_cert \\ nil) do
    start_finch(ca_cert)

    Finch.build(
      :get,
      "#{base_url}/system/listLatestUpgradablePackages?sid=#{system_id}",
      request_headers(auth)
    )
    |> Finch.request(Trento.Finch)
  end

  defp request_options(auth, ca_cert),
    do: [hackney: [cookie: [auth]]] ++ ssl_options(ca_cert) ++ timeout_options()

  defp timeout_options, do: [timeout: 1_500, recv_timeout: 1_500]

  defp ssl_options(nil), do: []

  defp ssl_options(ca_cert) do
    host = "https://sumafortrento.1x5gt0ji011u1b2nyny3mouqsc.ax.internal.cloudapp.net/"
    port = 443
    {_ans1_type, cert} = get_cert_der(222)
    # key = get_key_der()

    [
      recv_timeout: 30_000,
      ssl: [
        versions: [:"tlsv1.2", :"tlsv1.3"],
        cert: cert
        # key: key
      ]
    ]
  end

  def decode_pem_bin(pem_bin) do
    pem_bin |> :public_key.pem_decode() |> hd()
  end

  def decode_pem_entry(pem_entry) do
    :public_key.pem_entry_decode(pem_entry)
  end

  def encode_der(ans1_type, ans1_entity) do
    :public_key.der_encode(ans1_type, ans1_entity)
  end

  def split_type_and_entry(ans1_entry) do
    ans1_type = elem(ans1_entry, 0)
    {ans1_type, ans1_entry}
  end

  def get_cert_der(cert) do
    {cert_type, cert_entry} =
      cert
      |> decode_pem_bin()
      |> decode_pem_entry()
      |> split_type_and_entry()

    encode_der(cert_type, cert_entry)
  end
end
