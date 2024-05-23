defmodule Trento.Infrastructure.SoftwareUpdates.SumaApi do
  @moduledoc """
  SUMA API client supporting software updates discovery.
  """

  require Trento.SoftwareUpdates.Enums.AdvisoryType, as: AdvisoryType
  require Logger

  @login_retries 5

  @spec login(
          url :: String.t(),
          username :: String.t(),
          password :: String.t(),
          ca_cert :: String.t() | nil
        ) ::
          {:ok, any()} | {:error, :max_login_retries_reached | any()}
  def login(url, username, password, ca_cert),
    do:
      url
      |> get_suma_api_url()
      |> try_login(username, password, ca_cert, @login_retries)

  @spec get_system_id(
          url :: String.t(),
          auth :: any(),
          fully_qualified_domain_name :: String.t(),
          ca_cert :: String.t() | nil
        ) ::
          {:ok, pos_integer()} | {:error, :system_id_not_found | :authentication_error}
  def get_system_id(url, auth, fully_qualified_domain_name, ca_cert) do
    url
    |> get_suma_api_url()
    |> http_executor().get_system_id(auth, fully_qualified_domain_name, ca_cert)
    |> handle_auth_error()
    |> decode_response(
      error_atom: :system_id_not_found,
      error_log: "Failed to get system id for host #{fully_qualified_domain_name}."
    )
    |> extract_system_id()
  end

  @spec get_relevant_patches(
          url :: String.t(),
          auth :: any(),
          system_id :: pos_integer(),
          ca_cert :: String.t() | nil
        ) ::
          {:ok, [map()]}
          | {:error, :error_getting_patches | :authentication_error}
  def get_relevant_patches(url, auth, system_id, ca_cert) do
    url
    |> get_suma_api_url()
    |> http_executor().get_relevant_patches(auth, system_id, ca_cert)
    |> handle_auth_error()
    |> decode_response(
      error_atom: :error_getting_patches,
      error_log: "Failed to get errata for system ID #{system_id}."
    )
    |> extract_relevant_patches()
  end

  @spec get_upgradable_packages(
          url :: String.t(),
          auth :: any(),
          system_id :: pos_integer(),
          ca_cert :: String.t() | nil
        ) ::
          {:ok, [map()]}
          | {:error, :error_getting_packages | :authentication_error}
  def get_upgradable_packages(url, auth, system_id, ca_cert) do
    url
    |> get_suma_api_url()
    |> http_executor().get_upgradable_packages(auth, system_id, ca_cert)
    |> handle_auth_error()
    |> decode_response(
      error_atom: :error_getting_packages,
      error_log: "Failed to get upgradable packages for system ID #{system_id}."
    )
    |> extract_upgradable_packages()
  end

  @spec get_patches_for_package(
          url :: String.t(),
          auth :: any(),
          package_id :: String.t(),
          ca_cert :: String.t() | nil
        ) ::
          {:ok, [map()]}
          | {:error, :error_getting_patches | :authentication_error}
  def get_patches_for_package(url, auth, package_id, ca_cert) do
    url
    |> get_suma_api_url()
    |> http_executor().get_patches_for_package(auth, package_id, ca_cert)
    |> handle_auth_error()
    |> decode_response(
      error_atom: :error_getting_patches,
      error_log: "Failed to get patches for package ID #{package_id}."
    )
    |> extract_result()
  end

  @spec get_affected_systems(
          url :: String.t(),
          auth :: any(),
          advisory_name :: String.t(),
          ca_cert :: String.t() | nil
        ) ::
          {:ok, [map()]}
          | {:error, :error_getting_affected_systems | :authentication_error}
  def get_affected_systems(url, auth, advisory_name, ca_cert) do
    url
    |> get_suma_api_url()
    |> http_executor().get_affected_systems(auth, advisory_name, ca_cert)
    |> handle_auth_error()
    |> decode_response(
      error_atom: :error_getting_affected_systems,
      error_log: "Failed to get affected systems for advisory #{advisory_name}."
    )
    |> extract_result()
  end

  @spec get_errata_details(
          url :: String.t(),
          auth :: any(),
          advisory_name :: String.t(),
          ca_cert :: String.t() | nil
        ) ::
          {:ok, [map()]}
          | {:error, :error_getting_errata_details | :authentication_error}
  def get_errata_details(url, auth, advisory_name, ca_cert) do
    url
    |> get_suma_api_url()
    |> http_executor().get_errata_details(auth, advisory_name, ca_cert)
    |> handle_auth_error()
    |> decode_response(
      error_atom: :error_getting_errata_details,
      error_log: "Failed to get patches for advisory #{advisory_name}."
    )
    |> extract_result()
  end

  @spec get_cves(
          url :: String.t(),
          auth :: any(),
          advisory_name :: String.t(),
          ca_cert :: String.t() | nil
        ) ::
          {:ok, [map()]}
          | {:error, :error_getting_cves | :authentication_error}
  def get_cves(url, auth, advisory_name, ca_cert) do
    url
    |> get_suma_api_url()
    |> http_executor().get_cves(auth, advisory_name, ca_cert)
    |> handle_auth_error()
    |> decode_response(
      error_atom: :error_getting_cves,
      error_log: "Failed to get CVEs for advisory #{advisory_name}."
    )
    |> extract_result()
  end

  @spec get_affected_packages(
          url :: String.t(),
          auth :: any(),
          advisory_name :: String.t(),
          ca_cert :: String.t() | nil
        ) ::
          {:ok, [map()]}
          | {:error, :error_getting_affected_packages | :authentication_error}
  def get_affected_packages(url, auth, advisory_name, ca_cert) do
    url
    |> get_suma_api_url()
    |> http_executor().get_affected_packages(auth, advisory_name, ca_cert)
    |> handle_auth_error()
    |> decode_response(
      error_atom: :error_getting_affected_packages,
      error_log: "Failed to get affected packages for advisory #{advisory_name}."
    )
    |> extract_result()
  end

  defp handle_auth_error({:ok, %HTTPoison.Response{status_code: 401}}),
    do: {:error, :authentication_error}

  defp handle_auth_error({:ok, %HTTPoison.Response{status_code: _, body: body}}),
    do: {:ok, body}

  defp handle_auth_error(error), do: error

  defp decode_response({:ok, nil}, error_atom: error_atom, error_log: error_log) do
    Logger.error("#{error_log}. Nil body received.")

    {:error, error_atom}
  end

  defp decode_response({:ok, body}, error_atom: error_atom, error_log: error_log) do
    case Jason.decode(body, keys: :atoms) do
      {:ok, %{success: true}} = result ->
        result

      error ->
        Logger.error("#{error_log} Error: #{inspect(error)}")

        {:error, error_atom}
    end
  end

  defp decode_response({:error, :authentication_error}, _), do: {:error, :authentication_error}

  defp decode_response({:error, _} = error, error_atom: error_atom, error_log: error_log) do
    Logger.error("#{error_log} Error: #{inspect(error)}")

    {:error, error_atom}
  end

  defp extract_relevant_patches({:ok, %{success: true, result: result}}) do
    {:ok,
     Enum.map(result, fn %{advisory_type: advisory_type} = advisory ->
       %{advisory | advisory_type: AdvisoryType.from_string(advisory_type)}
     end)}
  end

  defp extract_relevant_patches({:error, _} = error), do: error

  defp extract_upgradable_packages({:ok, %{success: true, result: result}}) do
    {:ok, result}
  end

  defp extract_upgradable_packages({:error, _} = error), do: error

  defp extract_result({:ok, %{success: true, result: result}}) do
    {:ok, result}
  end

  defp extract_result({:error, _} = error), do: error

  defp get_suma_api_url(base_url),
    do: String.trim_trailing(base_url, "/") <> "/rhn/manager/api"

  defp try_login(_, _, _, _, 0) do
    Logger.error("Failed to Log into SUSE Manager. Max retries reached.")
    {:error, :max_login_retries_reached}
  end

  defp try_login(url, username, password, ca_cert, retry) do
    case do_login(url, username, password, ca_cert) do
      {:ok, _} = successful_login ->
        successful_login

      {:error, reason} ->
        Logger.error("Failed to Log into SUSE Manager, retrying...", error: inspect(reason))
        try_login(url, username, password, ca_cert, retry - 1)
    end
  end

  defp do_login(url, username, password, ca_cert) do
    case http_executor().login(url, username, password, ca_cert) do
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

  defp get_session_cookies(login_response_headers),
    do:
      login_response_headers
      |> Enum.filter(&suma_session_cookie?/1)
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

  defp extract_system_id(
         {:ok,
          %{
            success: true,
            result: [
              %{
                id: system_id
              }
              | _
            ]
          }}
       ) do
    {:ok, system_id}
  end

  defp extract_system_id({:ok, response}) do
    Logger.error(
      "Could not get system id for host from suma result. Result: #{inspect(response)}"
    )

    {:error, :system_id_not_found}
  end

  defp extract_system_id({:error, _} = error), do: error

  defp http_executor, do: Application.fetch_env!(:trento, __MODULE__)[:executor]
end
