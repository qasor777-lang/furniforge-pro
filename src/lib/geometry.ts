// Parametric geometry kernel (mini DSL evaluator)
// Inputs: param values + DSL JSON. Output: concrete parts list with mm dimensions.

export type ParamValues = Record<string, number>;

export interface PartDef {
  code: string;
  L: string | number;
  W: string | number;
  T: number;
  edges?: Record<string, string>;
  qty?: string | number;
}

export interface ResolvedPart {
  code: string;
  length: number;   // mm
  width: number;    // mm
  thickness: number;
  qty: number;
  edges: { top?: string; bottom?: string; left?: string; right?: string };
}

// Safe expression evaluator: supports +, -, *, /, parentheses, identifiers, numbers
export function evalExpr(expr: string | number, vars: ParamValues): number {
  if (typeof expr === "number") return expr;
  const trimmed = expr.trim();
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return parseFloat(trimmed);

  // Tokenize and validate (allow only safe characters)
  if (!/^[\w\d\s+\-*/().]+$/.test(trimmed)) {
    throw new Error(`Unsafe expression: ${expr}`);
  }

  // Replace identifiers with values
  const withVars = trimmed.replace(/[a-zA-Z_]\w*/g, (id) => {
    if (id in vars) return String(vars[id]);
    throw new Error(`Unknown variable: ${id}`);
  });

  // eslint-disable-next-line no-new-func
  const fn = new Function(`return (${withVars});`);
  const result = fn();
  if (typeof result !== "number" || !Number.isFinite(result)) {
    throw new Error(`Invalid result for: ${expr}`);
  }
  return result;
}

export function resolveParts(dsl: { parts: PartDef[] }, params: ParamValues): ResolvedPart[] {
  const out: ResolvedPart[] = [];
  for (const p of dsl.parts) {
    let qty = 1;
    if (p.qty !== undefined) {
      try { qty = Math.max(0, Math.round(evalExpr(p.qty as any, params))); }
      catch { qty = typeof p.qty === "number" ? p.qty : 1; }
    }
    if (qty <= 0) continue;
    const length = Math.max(0, evalExpr(p.L, params));
    const width = Math.max(0, evalExpr(p.W, params));
    out.push({
      code: p.code,
      length: Math.round(length),
      width: Math.round(width),
      thickness: p.T,
      qty,
      edges: {
        top: p.edges?.top || p.edges?.all,
        bottom: p.edges?.bottom || p.edges?.all,
        left: p.edges?.left || p.edges?.all,
        right: p.edges?.right || p.edges?.front || p.edges?.all,
      },
    });
  }
  return out;
}
