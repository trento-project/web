defmodule TrentoWeb.FallbackController do
  use TrentoWeb, :controller

  alias TrentoWeb.ErrorView

  def call(conn, {:error, :invalid_credentials}) do
    conn
    |> put_status(:unauthorized)
    |> put_view(ErrorView)
    |> render(:"401", reason: "Invalid credentials.")
  end

  def call(conn, {:error, :settings_not_configured}) do
    conn
    |> put_status(:unauthorized)
    |> put_view(ErrorView)
    |> render(:"401", reason: "SUSE Manager settings not configured.")
  end

  def call(conn, {:error, :invalid_refresh_token}) do
    conn
    |> put_status(:unauthorized)
    |> put_view(ErrorView)
    |> render(:"401", reason: "Invalid refresh token.")
  end

  def call(conn, {:error, :not_found}) do
    conn
    |> put_status(:not_found)
    |> put_view(ErrorView)
    |> render(:"404")
  end

  def call(conn, {:error, reason})
      when reason in [
             :host_not_registered,
             :cluster_not_registered,
             :sap_system_not_registered,
             :database_not_registered,
             :application_instance_not_registered,
             :database_instance_not_registered,
             :api_key_settings_missing
           ] do
    conn
    |> put_status(:not_found)
    |> put_view(ErrorView)
    |> render(:"404")
  end

  def call(conn, {:error, %Ecto.Changeset{} = changeset}) do
    conn
    |> put_status(:unprocessable_entity)
    |> put_view(ErrorView)
    |> render(:"422", changeset: changeset)
  end

  def call(conn, {:error, {:validation, _} = reason}) do
    conn
    |> put_status(:unprocessable_entity)
    |> put_view(ErrorView)
    |> render(:"422", reason: reason)
  end

  def call(conn, {:error, :unknown_discovery_type}) do
    conn
    |> put_status(:unprocessable_entity)
    |> put_view(ErrorView)
    |> render(:"422", reason: "Unknown discovery type.")
  end

  def call(conn, {:error, :host_alive}) do
    conn
    |> put_status(:unprocessable_entity)
    |> put_view(ErrorView)
    |> render(:"422", reason: "Requested operation not allowed for live hosts.")
  end

  def call(conn, {:error, :instance_present}) do
    conn
    |> put_status(:unprocessable_entity)
    |> put_view(ErrorView)
    |> render(:"422", reason: "Requested operation not allowed for present SAP instances.")
  end

  def call(conn, {:error, :settings_already_configured}) do
    conn
    |> put_status(:unprocessable_entity)
    |> put_view(ErrorView)
    |> render(:"422", reason: "Credentials have already been set.")
  end

  def call(conn, {:error, :no_checks_selected}) do
    conn
    |> put_status(:unprocessable_entity)
    |> put_view(ErrorView)
    |> render(:"422", reason: "No checks were selected for the target.")
  end

  def call(conn, {:error, :fqdn_not_found}) do
    conn
    |> put_status(:unprocessable_entity)
    |> put_view(ErrorView)
    |> render(:"422", reason: "No FQDN was found for the target host.")
  end

  def call(conn, {:error, :system_id_not_found}) do
    conn
    |> put_status(:unprocessable_entity)
    |> put_view(ErrorView)
    |> render(:"422", reason: "No system ID was found on SUSE Manager for this host.")
  end

  def call(conn, {:error, :error_getting_patches}) do
    conn
    |> put_status(:unprocessable_entity)
    |> put_view(ErrorView)
    |> render(:"422", reason: "Unable to retrieve relevant patches for this host.")
  end

  def call(conn, {:error, :error_getting_packages}) do
    conn
    |> put_status(:unprocessable_entity)
    |> put_view(ErrorView)
    |> render(:"422", reason: "Unable to retrieve upgradable packages for this host.")
  end

  def call(conn, {:error, :connection_test_failed}) do
    conn
    |> put_status(:unprocessable_entity)
    |> put_view(ErrorView)
    |> render(:"422", reason: "Connection with software updates provider failed.")
  end

  def call(conn, {:error, :forbidden}) do
    conn
    |> put_status(:forbidden)
    |> put_view(ErrorView)
    |> render(:"403")
  end

  def call(conn, {:error, [error | _]}), do: call(conn, {:error, error})

  def call(conn, {:error, _}) do
    conn
    |> put_status(:internal_server_error)
    |> put_view(ErrorView)
    |> render(:"500")
  end
end
