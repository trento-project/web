# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Support.Helpers.TlsTestServer do
  @moduledoc """
  A minimal HTTPS server for tests: it listens on 127.0.0.1 on a random port,
  serves the given certificate chain and answers every request with
  `200 ok`. A client that rejects the chain fails the handshake, the server
  ignores that and accepts the next connection.

      server = start_supervised!({TlsTestServer, certfile: certfile, keyfile: keyfile})
      port = TlsTestServer.port(server)
  """

  use GenServer

  def start_link(opts), do: GenServer.start_link(__MODULE__, opts)

  def port(server), do: GenServer.call(server, :port)

  @impl true
  def init(opts) do
    {:ok, listen} =
      :ssl.listen(0,
        certfile: Keyword.fetch!(opts, :certfile),
        keyfile: Keyword.fetch!(opts, :keyfile),
        ip: {127, 0, 0, 1},
        active: false,
        reuseaddr: true
      )

    {:ok, {_, port}} = :ssl.sockname(listen)
    spawn_link(fn -> accept(listen) end)

    {:ok, %{listen: listen, port: port}}
  end

  @impl true
  def handle_call(:port, _from, %{port: port} = state), do: {:reply, port, state}

  defp accept(listen) do
    case :ssl.transport_accept(listen) do
      {:ok, socket} ->
        serve(socket)
        accept(listen)

      {:error, :closed} ->
        :ok

      {:error, _} ->
        accept(listen)
    end
  end

  defp serve(socket) do
    with {:ok, socket} <- :ssl.handshake(socket, 5_000),
         {:ok, _request} <- :ssl.recv(socket, 0, 5_000) do
      :ssl.send(socket, "HTTP/1.1 200 OK\r\ncontent-length: 2\r\nconnection: close\r\n\r\nok")
    end

    :ssl.close(socket)
  end
end
