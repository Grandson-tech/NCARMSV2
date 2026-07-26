import { getSupabaseClient } from './client.js';

function unwrap(result) {
  if (result.error) throw result.error;
  return result.data;
}

function getTable(table) {
  if (!table || typeof table !== 'string') {
    throw new TypeError('A database table name is required.');
  }

  return getSupabaseClient().from(table);
}

export function selectRows(table, { columns = '*', filters = {}, options = {} } = {}) {
  let query = getTable(table).select(columns, options);
  Object.entries(filters).forEach(([column, value]) => {
    query = query.eq(column, value);
  });
  return query.then(unwrap);
}

export function countRows(table, { filters = {} } = {}) {
  let query = getTable(table).select('id', { count: 'exact', head: true });
  Object.entries(filters).forEach(([column, value]) => {
    query = query.eq(column, value);
  });

  return query.then((result) => {
    if (result.error) throw result.error;
    return result.count ?? 0;
  });
}

export function insertRows(table, records, { returning = 'representation', columns = '*' } = {}) {
  const query = getTable(table).insert(records);
  return (returning === 'minimal' ? query : query.select(columns)).then(unwrap);
}

export function updateRows(table, updates, { filters = {}, returning = 'representation', columns = '*' } = {}) {
  let query = getTable(table).update(updates);
  Object.entries(filters).forEach(([column, value]) => {
    query = query.eq(column, value);
  });
  return (returning === 'minimal' ? query : query.select(columns)).then(unwrap);
}

export function deleteRows(table, { filters = {} } = {}) {
  let query = getTable(table).delete();
  Object.entries(filters).forEach(([column, value]) => {
    query = query.eq(column, value);
  });
  return query.then(unwrap);
}

export function callDatabaseFunction(functionName, parameters = {}) {
  if (!functionName || typeof functionName !== 'string') {
    throw new TypeError('A database function name is required.');
  }

  return getSupabaseClient().rpc(functionName, parameters).then(unwrap);
}
