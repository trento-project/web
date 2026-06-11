# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.AI.OpenApiToolBuilderTest do
  use ExUnit.Case, async: true

  alias OpenApiSpex.{MediaType, Operation, Parameter, RequestBody, Schema}
  alias Trento.AI.OpenApiToolBuilder

  describe "description/1" do
    test "joins summary + description with a blank line" do
      op = %Operation{summary: "Sum", description: "Long form.", responses: %{}}
      assert OpenApiToolBuilder.description(op) == "Sum\n\nLong form."
    end

    test "drops nil / empty pieces" do
      assert OpenApiToolBuilder.description(%Operation{
               summary: "Sum",
               description: nil,
               responses: %{}
             }) == "Sum"

      assert OpenApiToolBuilder.description(%Operation{
               summary: "",
               description: "Body only",
               responses: %{}
             }) == "Body only"
    end

    test "returns '' for non-operation input" do
      assert OpenApiToolBuilder.description(nil) == ""
      assert OpenApiToolBuilder.description(:noop) == ""
    end
  end

  describe "parameters_schema/1" do
    test "returns empty object when no parameters and no request body" do
      op = %Operation{parameters: [], responses: %{}}

      assert OpenApiToolBuilder.parameters_schema(op) == %{
               "type" => "object",
               "properties" => %{}
             }
    end

    test "omits 'required' when no parameter is required" do
      op = %Operation{
        parameters: [
          %Parameter{
            name: :q,
            in: :query,
            required: false,
            schema: %Schema{type: :string}
          }
        ],
        responses: %{}
      }

      refute Map.has_key?(OpenApiToolBuilder.parameters_schema(op), "required")
    end

    test "merges path/query parameters with request-body properties + collects required keys" do
      op = %Operation{
        parameters: [
          %Parameter{
            name: :id,
            in: :path,
            required: true,
            description: "the id",
            schema: %Schema{type: :string, format: :uuid}
          },
          %Parameter{
            name: :verbose,
            in: :query,
            required: false,
            schema: %Schema{type: :boolean}
          }
        ],
        requestBody: %RequestBody{
          content: %{
            "application/json" => %MediaType{
              schema: %Schema{
                type: :object,
                properties: %{name: %Schema{type: :string}},
                required: [:name]
              }
            }
          }
        },
        responses: %{}
      }

      schema = OpenApiToolBuilder.parameters_schema(op)

      assert schema["type"] == "object"

      assert %{"type" => "string", "format" => "uuid", "description" => "the id"} =
               schema["properties"]["id"]

      assert %{"type" => "boolean"} = schema["properties"]["verbose"]
      assert %{"type" => "string"} = schema["properties"]["name"]
      assert Enum.sort(schema["required"]) == ["id", "name"]
    end

    test "resolves a module-reference parameter schema via the module's schema/0" do
      defmodule InlineRefSchema do
        def schema, do: %Schema{type: :integer, example: 42}
      end

      op = %Operation{
        parameters: [
          %Parameter{name: :n, in: :query, required: true, schema: InlineRefSchema}
        ],
        responses: %{}
      }

      assert %{"properties" => %{"n" => %{"type" => "integer", "example" => 42}}} =
               OpenApiToolBuilder.parameters_schema(op)
    end

    test "ignores requestBody.required: true flag; only collects requirements from the inner schema's required list" do
      op = %Operation{
        parameters: [],
        requestBody: %RequestBody{
          required: true,
          content: %{
            "application/json" => %MediaType{
              schema: %Schema{
                type: :object,
                properties: %{
                  name: %Schema{type: :string},
                  optional_field: %Schema{type: :string}
                },
                required: [:name]
              }
            }
          }
        },
        responses: %{}
      }

      schema = OpenApiToolBuilder.parameters_schema(op)

      assert schema["required"] == ["name"]
    end

    test "is a no-op for non-operation input" do
      assert OpenApiToolBuilder.parameters_schema(nil) ==
               %{"type" => "object", "properties" => %{}}
    end
  end

  describe "resolve_path_and_body/3" do
    test "routes path param into URL, query param into URL, body param into body map" do
      op = %Operation{
        parameters: [
          %Parameter{name: :id, in: :path, required: true, schema: %Schema{type: :string}},
          %Parameter{name: :limit, in: :query, required: false, schema: %Schema{type: :integer}}
        ],
        responses: %{}
      }

      assert {"/api/users/abc?limit=10", %{"extra" => "x"}} =
               OpenApiToolBuilder.resolve_path_and_body(
                 "/api/users/:id",
                 op,
                 %{"id" => "abc", "limit" => 10, "extra" => "x"}
               )
    end

    test "atom keys in args are stringified" do
      op = %Operation{
        parameters: [
          %Parameter{name: :id, in: :path, required: true, schema: %Schema{type: :string}}
        ],
        responses: %{}
      }

      assert {"/api/users/abc", %{}} =
               OpenApiToolBuilder.resolve_path_and_body("/api/users/:id", op, %{id: "abc"})
    end

    test "no declared params — all args land in body, path unchanged" do
      op = %Operation{parameters: [], responses: %{}}

      assert {"/api/things", %{"foo" => "bar"}} =
               OpenApiToolBuilder.resolve_path_and_body("/api/things", op, %{"foo" => "bar"})
    end

    test "nil operation — all args land in body, path unchanged" do
      assert {"/api/things", %{"foo" => "bar"}} =
               OpenApiToolBuilder.resolve_path_and_body("/api/things", nil, %{"foo" => "bar"})
    end

    test "fills :placeholder segments (Phoenix style)" do
      op = %Operation{
        parameters: [%Parameter{name: :id, in: :path, schema: %Schema{type: :string}}],
        responses: %{}
      }

      assert {"/api/users/alice", %{}} =
               OpenApiToolBuilder.resolve_path_and_body("/api/users/:id", op, %{"id" => "alice"})
    end

    test "fills {placeholder} segments (OpenAPI style)" do
      op = %Operation{
        parameters: [%Parameter{name: :id, in: :path, schema: %Schema{type: :string}}],
        responses: %{}
      }

      assert {"/api/users/alice", %{}} =
               OpenApiToolBuilder.resolve_path_and_body("/api/users/{id}", op, %{"id" => "alice"})
    end

    test "URI-encodes path values" do
      op = %Operation{
        parameters: [%Parameter{name: :id, in: :path, schema: %Schema{type: :string}}],
        responses: %{}
      }

      assert {"/api/users/a+b%2Fc", %{}} =
               OpenApiToolBuilder.resolve_path_and_body(
                 "/api/users/{id}",
                 op,
                 %{"id" => "a b/c"}
               )
    end

    test "nil path param value substitutes to empty string" do
      op = %Operation{
        parameters: [%Parameter{name: :id, in: :path, schema: %Schema{type: :string}}],
        responses: %{}
      }

      assert {"/x/", %{}} =
               OpenApiToolBuilder.resolve_path_and_body("/x/:id", op, %{"id" => nil})
    end

    test "no query params — path has no query string" do
      op = %Operation{parameters: [], responses: %{}}

      assert {"/x", %{}} =
               OpenApiToolBuilder.resolve_path_and_body("/x", op, %{})
    end

    test "scalar query param appended as ?k=v" do
      op = %Operation{
        parameters: [%Parameter{name: :a, in: :query, schema: %Schema{type: :integer}}],
        responses: %{}
      }

      assert {"/x?a=1", %{}} =
               OpenApiToolBuilder.resolve_path_and_body("/x", op, %{"a" => 1})
    end

    test "list query param explodes into repeated keys" do
      op = %Operation{
        parameters: [%Parameter{name: :sev, in: :query, schema: %Schema{type: :string}}],
        responses: %{}
      }

      assert {"/x?sev=a&sev=b", %{}} =
               OpenApiToolBuilder.resolve_path_and_body("/x", op, %{"sev" => ["a", "b"]})
    end
  end
end
