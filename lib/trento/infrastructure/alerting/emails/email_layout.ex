# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Infrastructure.Alerting.Emails.EmailLayout do
  @moduledoc """
  Common layout of the Trento alerting emails.

  It provides the shared styling, header and footer, wrapping the content
  of each specific email.
  """

  use TrentoWeb, :html

  embed_templates "email_templates/layouts/*"
end
