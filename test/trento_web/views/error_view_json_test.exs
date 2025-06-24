defmodule TrentoWeb.ErrorJSONTest do
  use ExUnit.Case
  alias TrentoWeb.ErrorJSON

  test "should render a 400 error" do
    assert %{
             errors: [
               %{
                 detail: "runtime error",
                 title: "Bad Request"
               }
             ]
           } == ErrorJSON.render("400.json", %{reason: %{exception: %RuntimeError{}}})
  end

  test "should render a 401 error" do
    assert %{
             errors: [
               %{
                 detail: "Invalid credentials.",
                 title: "Unauthorized"
               }
             ]
           } == ErrorJSON.render("401.json", %{reason: "Invalid credentials."})
  end

  test "should render a 403 error" do
    assert %{
             errors: [
               %{
                 detail: "Insufficient permissions.",
                 title: "Forbidden"
               }
             ]
           } == ErrorJSON.render("403.json", %{reason: "Insufficient permissions."})
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
             ErrorJSON.render("404.json", [])
  end

  test "should render a 422 error (string)" do
    assert %{
             errors: [
               %{
                 detail: "Invalid values.",
                 title: "Unprocessable Entity"
               }
             ]
           } == ErrorJSON.render("422.json", %{reason: "Invalid values."})
  end

  test "should render a 409 error" do
    assert %{
             errors: [
               %{
                 title: "Conflict has occurred",
                 detail: "Generic conflicting state"
               }
             ]
           } == ErrorJSON.render("409.json", %{reason: "Generic conflicting state"})
  end

  test "should render a 422 error (validation error)" do
    {:error, validation_error} = TestData.new(%{embedded: %{id: "invalid", name: 0}})

    assert %{
             errors: [
               %{detail: "can't be blank", source: %{pointer: "/id"}, title: "Invalid value"},
               %{detail: "can't be blank", source: %{pointer: "/name"}, title: "Invalid value"},
               %{
                 detail: "is invalid",
                 source: %{pointer: "/embedded/id"},
                 title: "Invalid value"
               },
               %{
                 detail: "is invalid",
                 source: %{pointer: "/embedded/name"},
                 title: "Invalid value"
               },
               %{
                 detail: "can't be blank",
                 source: %{pointer: "/polymorphic"},
                 title: "Invalid value"
               }
             ]
           } == ErrorJSON.render("422.json", %{reason: validation_error})
  end

  test "should render a 422 error (changeset)" do
    changeset = TestData.changeset(%TestData{}, %{embedded: %{id: "invalid", name: 0}})

    assert %{
             errors: [
               %{detail: "can't be blank", source: %{pointer: "/id"}, title: "Invalid value"},
               %{detail: "can't be blank", source: %{pointer: "/name"}, title: "Invalid value"},
               %{
                 detail: "is invalid",
                 source: %{pointer: "/embedded/id"},
                 title: "Invalid value"
               },
               %{
                 detail: "is invalid",
                 source: %{pointer: "/embedded/name"},
                 title: "Invalid value"
               },
               %{
                 detail: "can't be blank",
                 source: %{pointer: "/polymorphic"},
                 title: "Invalid value"
               }
             ]
           } == ErrorJSON.render("422.json", %{changeset: changeset})
  end

  test "should render a 422 error (changeset) with interpolated values" do
    changeset =
      TestDataWithValidation.changeset(%TestDataWithValidation{}, %{password: "short"})

    assert %{
             errors: [
               %{
                 detail: "should be at least 8 character(s)",
                 source: %{pointer: "/password"},
                 title: "Invalid value"
               }
             ]
           } == ErrorJSON.render("422.json", %{changeset: changeset})
  end

  test "should render a 500 error" do
    assert %{
             errors: [
               %{
                 detail: "Something went wrong.",
                 title: "Internal Server Error"
               }
             ]
           } == ErrorJSON.render("500.json", %{detail: "Something went wrong."})
  end

  test "should render a generic error based on the template name" do
    assert %{
             errors: [
               %{
                 detail: "An error has occurred.",
                 title: "I'm a teapot"
               }
             ]
           } == ErrorJSON.render("418.json", [])
  end
end
