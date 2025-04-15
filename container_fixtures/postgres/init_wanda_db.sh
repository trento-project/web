#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
  CREATE DATABASE wanda_db;
  CREATE ROLE wanda_user WITH LOGIN PASSWORD 'wanda_pass';
  GRANT ALL PRIVILEGES ON DATABASE wanda_db TO wanda_user;
  
  \c wanda_db
  GRANT USAGE, CREATE ON SCHEMA public TO wanda_user;
EOSQL