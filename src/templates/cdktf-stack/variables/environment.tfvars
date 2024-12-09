namespace = "<%= namespace %>"
name = "<%= name %>"
environment = "<%= environment.name %>"
domain = "<%= environment.domain %>"
host = "https://<%= name %>.api.<%= environment.domain %>"
allowed_origins =  "https://<%= environment.domain %>"
code_s3_bucket = "<%= namespace %>-deploys-<%= environment.region %>-<%= environment.name %>"
domain_prefix = "dev"<% if(type === 'user') { %>
redirect_uri = ["https://<%= environment.domain %>/login"<% if(environment.isFirst) { %>, "http://localhost:3000/login"<% } %>]<% } %>
