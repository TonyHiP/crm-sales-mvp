export function contieneSQLInvalido(texto: string): boolean {
  if (!texto) return false;
  const sqlRegex = /['";\-\-]|(\b(SELECT|UNION|INSERT|DELETE|DROP|UPDATE|WHERE|OR|AND)\b)/i;
  return sqlRegex.test(texto);
}
