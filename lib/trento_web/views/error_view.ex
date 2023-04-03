defmodule TrentoWeb.ErrorView do
  use TrentoWeb, :view

  def render("400.json", %{reason: %{exception: exception}}) do
    %{
      errors: [
        %{
          title: "Bad Request",
          detail: Exception.message(exception)
        }
      ]
    }
  end

  def render("401.json", %{reason: reason}) do
    %{
      errors: [
        %{
          title: "Unauthorized",
          detail: reason
        }
      ]
    }
  end

  def render("404.json", _) do
    %{
      errors: [
        %{
          title: "Not Found",
          detail: "The requested resource cannot be found."
        }
      ]
    }
  end

  def render("422.json", %{changeset: changeset}) do
    error =
      Ecto.Changeset.traverse_errors(
        changeset,
        fn {message, _} -> message end
      )

    %{
      errors: render_validation_error(error, "")
    }
  end

  def render("422.json", %{reason: {:validation, error}}) do
    %{
      errors: render_validation_error(error, "")
    }
  end

  def render("422.json", %{reason: reason}) do
    %{
      errors: [
        %{
          title: "Unprocessable Entity",
          detail: reason
        }
      ]
    }
  end

  def render("500.json", _) do
    %{
      errors: [
        %{
          title: "Internal Server Error",
          detail: "Something went wrong."
        }
      ]
    }
  end

  def template_not_found(template, _assigns) do
    %{
      errors: [
        %{
          title: Phoenix.Controller.status_message_from_template(template),
          detail: "An error has occurred."
        }
      ]
    }
  end

  defp render_validation_error({key, value}, pointer) when is_map(value) do
    render_validation_error(value, "#{pointer}/#{key}")
  end

  defp render_validation_error({key, value}, pointer) when is_list(value) do
    Enum.map(value, &render_validation_error({key, &1}, pointer))
  end

  defp render_validation_error({key, value}, pointer) do
    %{
      title: "Invalid value",
      detail: value,
      source: %{
        pointer: "#{pointer}/#{key}"
      }
    }
  end

  defp render_validation_error(error, pointer) do
    Enum.flat_map(error, &render_validation_error(&1, pointer))
  end
end
