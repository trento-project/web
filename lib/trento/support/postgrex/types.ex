# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

Postgrex.Types.define(
  Trento.Postgrex.Types,
  [Trento.Postgrex.Jsonpath],
  decode_binary: :reference
)
