defmodule TrentoWeb.ErrorViewTest do
  use ExUnit.Case

  import Phoenix.View

  test "should render a generic error based on the template name" do
    assert %{
             errors: [
               %{
                 detail: "An error has occurred.",
                 title: "I'm a teapot"
               }
             ]
           } == render(TrentoWeb.ErrorView, "418.json", [])
  end

  test "should render a 400 error" do
    assert %{
             errors: [
               %{
                 detail: "runtime error",
                 title: "Bad Request"
               }
             ]
           } == render(TrentoWeb.ErrorView, "400.json", reason: %{exception: %RuntimeError{}})
  end

  test "should render a 401 error" do
    assert %{
             errors: [
               %{
                 detail: "Invalid credentials.",
                 title: "Unauthorized"
               }
             ]
           } == render(TrentoWeb.ErrorView, "401.json", detail: "Invalid credentials.")
  end

  test "should render a 404 error" do
    assert %{
             errors: [
               %{
                 detail: "The requested resource cannot be found.",
                 title: "Not Found"
               }
             ]
           } ==
             render(TrentoWeb.ErrorView, "404.json",
               detail: "The requested resource cannot be found."
             )
  end

  test "should render a 422 error (string)" do
    assert %{
             errors: [
               %{
                 detail: "Invalid values.",
                 title: "Unprocessable Entity"
               }
             ]
           } == render(TrentoWeb.ErrorView, "422.json", error: "Invalid values.")
  end

  test "should render a 422 error (validation error)" do
    {:error, validation_errors} = TestData.new(%{})

    assert %{
             errors: [
               %{
                 detail: "can't be blank",
                 title: "Invalid value",
                 source: %{pointer: "/embedded"}
               },
               %{detail: "can't be blank", source: %{pointer: "/id"}, title: "Invalid value"},
               %{detail: "can't be blank", source: %{pointer: "/name"}, title: "Invalid value"}
             ]
           } == render(TrentoWeb.ErrorView, "422.json", error: validation_errors)
  end

  test "should render a 500 error" do
    assert %{
             errors: [
               %{
                 detail: "Something went wrong.",
                 title: "Internal Server Error"
               }
             ]
           } == render(TrentoWeb.ErrorView, "500.json", detail: "Something went wrong.")
  end
end
