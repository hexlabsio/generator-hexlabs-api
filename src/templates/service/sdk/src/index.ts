export * from '../generated/<%= namespace %>-<%= name %>-api/sdk';
export * from '../generated/<%= namespace %>-<%= name %>-api/model';<% if(type === 'user') { %>
export * from './claims.ts'<% } %>
