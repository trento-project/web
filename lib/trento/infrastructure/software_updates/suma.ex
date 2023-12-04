defmodule Trento.Infrastructure.SUMA do
  @moduledoc """
  SUSE Manager integration service
  """

  use Agent

  require Logger

  @suma_url Application.compile_env!(:trento, :suma)[:base_url]

  def start_link(initial_value) do
    Agent.start_link(fn -> initial_value end, name: __MODULE__)
  end

  def login do
    suma_user = Application.fetch_env!(:trento, :suma)[:user]
    suma_password = Application.fetch_env!(:trento, :suma)[:password]

    payload =
      Jason.encode!(%{
        "login" => suma_user,
        "password" => suma_password
      })

    case HTTPoison.post(
           "#{@suma_url}/auth/login",
           payload,
           [{"Content-type", "application/json"}],
           ssl: [verify: :verify_none]
         ) do
      {:ok, %HTTPoison.Response{headers: headers} = response} ->
        Agent.update(__MODULE__, fn _ ->
          get_session_cookies(headers)
        end)

        Logger.debug("Successfully logged into suma #{inspect(response)}")
        {:ok, :logged_in}

      {:error, reason} ->
        Logger.error("Failed to login to SUSE Manager. Error: #{inspect(reason)}")
        {:error, :unable_to_login}
    end
  end

  def list_affected_systems() do
    case get_auth_cookies() do
      nil ->
        Logger.error("Unable to get auth cookies")
        {:error, :unable_to_get_auth_cookies}

      cookies ->
        response =
          HTTPoison.get(
            "#{@suma_url}/errata/listAffectedSystems?advisoryName=SUSE-15-SP4-2023-4615",
            [{"Content-type", "application/json"}],
            hackney: [cookie: [cookies]],
            ssl: [verify: :verify_none]
          )

        Logger.debug("Response from list_affected_systems #{inspect(response)}")

        {:ok, :list_affected_systems}
    end
  end

  def get_auth_cookies() do
    Agent.get(__MODULE__, & &1)
  end

  defp get_session_cookies(login_response_headers) do
    Enum.filter(login_response_headers, fn {key, value} ->
      String.match?(key, ~r/\Aset-cookie\z/i) &&
        String.starts_with?(value, "pxt-session-cookie=")
    end)
    |> Enum.map(fn {_, value} ->
      parts = String.split(value, ";")

      Enum.find(parts, fn part ->
        String.starts_with?(part, "pxt-session-cookie=")
      end)
    end)
    |> List.last()
  end
end
