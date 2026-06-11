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

  describe "param_locations/1" do
    test "returns a map of string parameter names to their declared location" do
      op = %Operation{
        parameters: [
          %Parameter{name: :id, in: :path},
          %Parameter{name: "verbose", in: :query}
        ],
        responses: %{}
      }

      assert OpenApiToolBuilder.param_locations(op) == %{
               "id" => :path,
               "verbose" => :query
             }
    end

    test "returns an empty map for an empty parameter list" do
      assert OpenApiToolBuilder.param_locations(%Operation{parameters: [], responses: %{}}) == %{}
    end

    test "returns an empty map for non-operation input" do
      assert OpenApiToolBuilder.param_locations(nil) == %{}
    end
  end

  describe "param_locations/1 + split_args/2" do
    test "buckets args by declared :in field; unknown keys land in body" do
      op = %Operation{
        parameters: [
          %Parameter{name: :id, in: :path, required: true, schema: %Schema{type: :string}},
          %Parameter{name: :limit, in: :query, required: false, schema: %Schema{type: :integer}}
        ],
        responses: %{}
      }

      locations = OpenApiToolBuilder.param_locations(op)

      assert {%{"id" => "abc"}, %{"limit" => 10}, %{"extra" => "x"}} =
               OpenApiToolBuilder.split_args(locations, %{
                 "id" => "abc",
                 "limit" => 10,
                 "extra" => "x"
               })
    end

    test "atom keys in args are stringified" do
      op = %Operation{
        parameters: [
          %Parameter{name: :id, in: :path, required: true, schema: %Schema{type: :string}}
        ],
        responses: %{}
      }

      locations = OpenApiToolBuilder.param_locations(op)

      assert {%{"id" => "abc"}, %{}, %{}} =
               OpenApiToolBuilder.split_args(locations, %{id: "abc"})
    end
  end

  describe "substitute_path/2" do
    test "fills :placeholder segments (Phoenix style)" do
      assert OpenApiToolBuilder.substitute_path("/api/users/:id", %{"id" => "alice"}) ==
               "/api/users/alice"
    end

    test "fills {placeholder} segments (OpenAPI style)" do
      assert OpenApiToolBuilder.substitute_path("/api/users/{id}", %{"id" => "alice"}) ==
               "/api/users/alice"
    end

    test "URI-encodes values" do
      assert OpenApiToolBuilder.substitute_path("/api/users/{id}", %{"id" => "a b/c"}) ==
               "/api/users/a+b%2Fc"
    end

    test "treats nil values as empty" do
      assert OpenApiToolBuilder.substitute_path("/x/:id", %{"id" => nil}) == "/x/"
    end
  end

  describe "append_query/2" do
    test "no query → unchanged path" do
      assert OpenApiToolBuilder.append_query("/x", %{}) == "/x"
    end

    test "scalar values → ?k=v" do
      assert OpenApiToolBuilder.append_query("/x", %{"a" => 1}) == "/x?a=1"
    end

    test "list values explode into repeated keys" do
      result = OpenApiToolBuilder.append_query("/x", %{"sev" => ["a", "b"]})
      assert result == "/x?sev=a&sev=b"
    end
  end
end
