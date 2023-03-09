defmodule TrentoWeb.ErrorView do
  use TrentoWeb, :view

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

  def render("401.json", %{detail: detail}) do
    %{
      errors: [
        %{
          title: "Unauthorized",
          detail: detail
        }
      ]
    }
  end

  def render("422.json", %{error: error}) when is_map(error) do
    %{
      errors: render_validation_error(error, "")
    }
  end

  def render("422.json", %{error: error}) do
    %{
      errors: [
        %{
          title: "Invalid value",
          detail: error
        }
      ]
    }
  end

  def render("404.json", %{detail: detail}) do
    %{
      errors: [
        %{
          title: "Not Found",
          detail: detail
        }
      ]
    }
  end

  def render("500.json", %{detail: detail}) do
    %{
      errors: [
        %{
          title: "Internal Server Error",
          detail: detail
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
