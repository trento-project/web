defmodule TrentoWeb.V1.AIAgentController do
  use TrentoWeb, :controller

  # AG-UI clients usually start a run via a POST request
  # def stream(%{body_params: %{"method" => "info"}} = conn, _params) do
  #   resp = %{
  #     version: "1.52.1",
  #     agents: %{
  #       sample_agent: %{
  #         name: "sample_agent",
  #         description: "",
  #         className: "LangGraphAgent$1"
  #       }
  #     },
  #     audioFileTranscriptionEnabled: false
  #   }

  #   json(conn, resp)
  # end

  # def stream(%{body_params: %{"method" => "agent/connect"}} = conn, _params) do
  #   # For simplicity, we just return a 200 OK here.
  #   # The AG-UI expects the SSE stream to be established on the same endpoint after this.
  #   send_resp(conn, 200, "")
  # end

  # def stream(%{body_params: %{"method" => "agent/run"}} = conn, _params) do
  #   dummy_response(conn, _params)
  # end

  def stream(conn, params) do
    dummy_response(conn, params)
    # send_resp(conn, 404, "")
  end

  def dummy_response(conn, _params) do
    # 1. Prepare the connection for Server-Sent Events

    # IO.inspect(conn.body_params, label: "Incoming AG-UI SSE Connection")

    conn =
      conn
      |> put_resp_header("content-type", "text/event-stream")
      |> put_resp_header("cache-control", "no-cache")
      |> put_resp_header("connection", "keep-alive")
      |> send_chunked(200)

    # Generate unique IDs for the mock
    run_id = "run_#{System.unique_integer([:positive])}"
    message_id = "msg_#{System.unique_integer([:positive])}"

    # 2. Start the AG-UI Run Sequence
    send_ag_event(conn, "RUN_STARTED", %{
      # "type": "RUN_STARTED",
      threadId: "38de85e9-adbe-4b3b-b5ba-f10585db6c40",
      runId: "919c31f7-5663-4f62-863d-931a173a4be7",
      input: %{
        threadId: "38de85e9-adbe-4b3b-b5ba-f10585db6c40",
        runId: "919c31f7-5663-4f62-863d-931a173a4be7",
        state: %{
          proverbs: [
            "CopilotKit may be new, but its the best thing since sliced bread."
          ]
        },
        messages: [
          %{
            id: "d90dc1a4-4f36-455b-81c2-53704ffb72e6",
            role: "user",
            content: "test"
          }
        ],
        tools: [
          %{
            name: "addProverb",
            description: "Add a proverb to the list.",
            parameters: "[Truncated depth]"
          },
          %{
            name: "setThemeColor",
            description: "Set the theme color of the page.",
            parameters: "[Truncated depth]"
          }
        ],
        context: [],
        forwardedProps: %{}
      }
    })

    # Small delay for realism
    Process.sleep(1000)

    send_ag_event(conn, "TEXT_MESSAGE_START", %{
      "runId" => run_id,
      "messageId" => message_id,
      "role" => "assistant"
    })

    # 3. Stream the mock text tokens
    chunks = [
      "Hello! ",
      "I am ",
      "a mock ",
      "AG-UI agent ",
      "running via ",
      "Server-Sent Events ",
      "in Elixir. ",
      "This is ",
      "a standard ",
      "HTTP stream!"
    ]

    markdown_chunks = [
      "Hello! ",
      "I am ",
      "**bold** ",
      "*italic* ",
      "`inline code` ",
      "~~strikethough~~ ",
      "\n> blockquote "
    ]

    Enum.each(chunks ++ markdown_chunks, fn chunk ->
      # Simulate token generation delay
      Process.sleep(500)

      send_ag_event(conn, "TEXT_MESSAGE_CONTENT", %{
        "runId" => run_id,
        "messageId" => message_id,
        "delta" => chunk
      })
    end)

    # 4. End the message and the run
    Process.sleep(1000)

    send_ag_event(conn, "TEXT_MESSAGE_END", %{
      "runId" => run_id,
      "messageId" => message_id
    })

    send_ag_event(conn, "RUN_FINISHED", %{"runId" => run_id})

    # 5. Return the closed connection
    conn
  end

  # --- Helper to format and push SSE chunks ---
  defp send_ag_event(conn, type, payload) do
    # AG-UI expects the event type inside the JSON payload
    full_payload =
      payload
      |> Map.put("type", type)
      # Ensure threadId is always present
      |> Map.put_new("threadId", UUID.uuid4())

    # Standard SSE format requires `data: <string payload>\n\n`
    json_string = Jason.encode!(full_payload)
    sse_chunk = "data: #{json_string}\n\n"

    # Push the chunk to the client
    {:ok, conn} = Plug.Conn.chunk(conn, sse_chunk)
    conn
  end
end
