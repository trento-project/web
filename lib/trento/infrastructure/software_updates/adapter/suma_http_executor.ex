defmodule Trento.Infrastructure.SoftwareUpdates.Suma.HttpExecutor do
  @moduledoc """
  SUMA Http requests executor
  """

  @callback login(base_url :: String.t(), username :: String.t(), password :: String.t()) ::
              {:ok, HTTPoison.Response.t()} | {:error, HTTPoison.Error.t()}

  @callback get_system_id(
              base_url :: String.t(),
              auth :: String.t(),
              fully_qualified_domain_name :: String.t()
            ) ::
              {:ok, HTTPoison.Response.t()} | {:error, HTTPoison.Error.t()}

  @behaviour Trento.Infrastructure.SoftwareUpdates.Suma.HttpExecutor

  @impl true
  def login(base_url, username, password) do
    payload =
      Jason.encode!(%{
        "login" => username,
        "password" => password
      })

    HTTPoison.post(
      "#{base_url}/auth/login",
      payload,
      [{"Content-type", "application/json"}],
      ssl: [verify: :verify_none]
    )
  end

  @impl true
  def get_system_id(base_url, auth, fully_qualified_domain_name) do
    HTTPoison.get(
      "#{base_url}/system/getId?name=#{fully_qualified_domain_name}",
      [{"Content-type", "application/json"}],
      hackney: [cookie: [auth]],
      ssl: [verify: :verify_none]
    )
  end
end
