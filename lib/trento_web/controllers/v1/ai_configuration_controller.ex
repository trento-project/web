defmodule TrentoWeb.V1.AIConfigurationController do
  use TrentoWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias Trento.Users.User

  alias Trento.AI

  alias Trento.AI.UserConfiguration

  alias TrentoWeb.OpenApi.V1.Schema

  import Plug.Conn

  plug TrentoWeb.Plugs.LoadUserPlug

  plug OpenApiSpex.Plug.CastAndValidate, json_render_error_v2: true
  action_fallback TrentoWeb.FallbackController

  operation :create_ai_configuration,
    summary: "Creates User's AI Configuration",
    description: "Creates a new AI configuration for the currently authenticated user.",
    tags: ["Profile"],
    request_body:
      {"CreateUserAIConfiguration", "application/json", Schema.AI.CreateUserConfigurationRequest},
    responses: [
      created:
        {"User AI Configuration created successfully.", "application/json",
         Schema.AI.UserConfiguration},
      unprocessable_entity: Schema.UnprocessableEntity.response(),
      unauthorized: Schema.Unauthorized.response(),
      forbidden: Schema.Forbidden.response()
    ]

  def create_ai_configuration(conn, _) do
    %User{} = current_user = Pow.Plug.current_user(conn)

    creation_params = OpenApiSpex.body_params(conn)

    with {:ok, %UserConfiguration{} = user_ai_config} <-
           AI.create_user_configuration(current_user, creation_params) do
      conn
      |> put_status(:created)
      |> render(:ai_configuration, %{ai_configuration: user_ai_config})
    end
  end

  operation :update_ai_configuration,
    summary: "Updates User's AI Configuration",
    description: "Updates the AI configuration for the currently authenticated user.",
    tags: ["Profile"],
    request_body:
      {"UpdateUserAIConfiguration", "application/json", Schema.AI.UpdateUserConfigurationRequest},
    responses: [
      ok:
        {"User AI Configuration updated successfully.", "application/json",
         Schema.AI.UserConfiguration},
      unprocessable_entity: Schema.UnprocessableEntity.response(),
      unauthorized: Schema.Unauthorized.response(),
      forbidden: Schema.Forbidden.response()
    ]

  def update_ai_configuration(conn, _) do
    %User{} = current_user = Pow.Plug.current_user(conn)

    update_params = OpenApiSpex.body_params(conn)

    with {:ok, %UserConfiguration{} = user_ai_config} <-
           AI.update_user_configuration(current_user, update_params) do
      conn
      |> put_status(:ok)
      |> render(:ai_configuration, %{ai_configuration: user_ai_config})
    end
  end
end
