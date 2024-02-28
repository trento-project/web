defmodule Trento.Infrastructure.SoftwareUpdates.SumaApi do
  @moduledoc """
  SUMA API client supporting software updates discovery.
  """

  require Logger

  @login_retries 5

  def login(url, username, password),
    do:
      url
      |> get_suma_api_url()
      |> try_login(username, password, @login_retries)

  def get_system_id(url, auth, fully_qualified_domain_name) do
    response =
      url
      |> get_suma_api_url()
      |> http_executor().get_system_id(auth, fully_qualified_domain_name)

    with {:ok, %HTTPoison.Response{status_code: 200, body: body}} <- response,
         {:ok, %{"success" => true, "result" => result}} <- Jason.decode(body),
         {:ok, system_id} <- extract_system_id(result) do
      {:ok, system_id}
    else
      error ->
        Logger.error(
          "Failed to get system id for host #{fully_qualified_domain_name}. Error: #{inspect(error)}"
        )

        {:error, :system_id_not_found}
    end
  end

  defp get_suma_api_url(base_url),
    do: String.trim_trailing(base_url, "/") <> "/rhn/manager/api"

  defp try_login(_, _, _, 0) do
    Logger.error("Failed to Log into SUSE Manager. Max retries reached.")
    {:error, :max_login_retries_reached}
  end

  defp try_login(url, username, password, retry) do
    case do_login(url, username, password) do
      {:ok, _} = successful_login ->
        successful_login

      {:error, reason} ->
        Logger.error("Failed to Log into SUSE Manager, retrying...", error: inspect(reason))
        try_login(url, username, password, retry - 1)
    end
  end

  defp do_login(url, username, password) do
    case http_executor().login(url, username, password) do
      {:ok, %HTTPoison.Response{headers: headers, status_code: 200} = response} ->
        Logger.debug("Successfully logged into suma #{inspect(response)}")
        {:ok, get_session_cookies(headers)}

      {:ok, %HTTPoison.Response{status_code: _} = response} ->
        Logger.error(
          "Failed to login to SUSE Manager due to unsuccessful response. Response: #{inspect(response)}"
        )

        {:error, :login_error}

      {:error, reason} ->
        Logger.error("Failed to login to SUSE Manager due to an error. Error: #{inspect(reason)}")
        {:error, :login_error}
    end
  end

  def get_session_cookies(login_response_headers),
    do:
      login_response_headers
      |> Enum.filter(&suma_session_cookie?(& 1))
      |> Enum.map(fn {_, value} -> get_suma_session_cookie(value) end)
      |> List.last()

  defp suma_session_cookie?({header_name, header_value}),
    do:
      String.match?(header_name, ~r/\Aset-cookie\z/i) &&
        match_suma_session_cookie(header_value)

  defp match_suma_session_cookie(cookies),
    do: String.starts_with?(cookies, "pxt-session-cookie=")

  defp get_suma_session_cookie(cookies),
    do:
      cookies
      |> String.split(";")
      |> Enum.find(&match_suma_session_cookie(&1))

  defp extract_system_id(result) do
    with false <- Enum.empty?(result),
         %{"id" => system_id} <- Enum.at(result, 0) do
      {:ok, system_id}
    else
      _ ->
        Logger.error(
          "Could not get system id for host from suma result. Result: #{inspect(result)}"
        )

        {:error, :system_id_not_found}
    end
  end

  defp http_executor, do: Application.fetch_env!(:trento, __MODULE__)[:executor]
end
