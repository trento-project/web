# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule TrentoWeb.Auth.FakeIdentityProvider do
  @moduledoc """
  Assent HTTP adapter faking an OAuth2/OIDC identity provider.

  - `https://provider.example.com` issues a token for any code but `expired`,
    which it rejects with `invalid_grant`, and returns the `sso_user` claims
  - `https://unreachable.example.com` fails as a provider that is down
  """

  @behaviour Assent.HTTPAdapter

  alias Assent.HTTPAdapter.HTTPResponse

  @impl true
  def request(_method, "https://unreachable.example.com" <> _, _body, _headers, _opts),
    do: {:error, :econnrefused}

  def request(:post, "https://provider.example.com/oauth/token", body, _headers, _opts) do
    if body =~ "code=expired",
      do: http_response(400, %{"error" => "invalid_grant"}),
      else: http_response(200, %{"access_token" => "access_token", "token_type" => "bearer"})
  end

  def request(:get, "https://provider.example.com/api/user", _body, _headers, _opts),
    do:
      http_response(200, %{
        "sub" => "sso_user",
        "username" => "sso_user",
        "email" => "sso_user@trento.com"
      })

  defp http_response(status, body),
    do:
      {:ok,
       %HTTPResponse{
         status: status,
         headers: [{"content-type", "application/json"}],
         body: Jason.encode!(body)
       }}
end
