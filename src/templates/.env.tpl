PORT=<%= port %>
HOST=http://localhost:${PORT}
BASE_PATH=
ALLOWED_ORIGIN=*
AWS_REGION=eu-west-1
<% if(databaseTechnology === 'DynamoDB') { %>TABLES_<%= name.toUpperCase() %>=<%= namespace %>-<%= name %>-development<% } %>
