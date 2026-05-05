#!/bin/bash
# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
  CREATE DATABASE wanda_db;
EOSQL