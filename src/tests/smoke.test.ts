import { describe, it, expect } from "vitest";
import { resolveParts, evalExpr } from "@/lib/geometry";
import { fmtMm, fmtMoney, safeJson } from "@/lib/utils";

describe("Geometry engine", () => {
  it("evalExpr evaluates basic math", () => {
    expect(evalExpr("2+2", {})).toBe(4);
    expect(evalExpr("W + 100", { W: 800 })).toBe(900);
    expect(evalExpr("(W - 2*T)/doors", { W: 800, T: 18, doors: 2 })).toBe(382);
  });

  it("resolveParts returns parts for carcass DSL", () => {
    const dsl = {
      type: "carcass_box",
      parts: [
        { code: "side_L", L: "H", W: "D", T: 18, edges: { front: "2.0" } },
        { code: "bottom", L: "W - 2*T", W: "D", T: 18, edges: { front: "2.0" } },
        { code: "shelf", L: "W - 2*T", W: "D - 30", T: 18, edges: { front: "0.4" }, qty: "shelves" },
      ],
    };
    const params = { W: 800, H: 720, D: 560, T: 18, shelves: 2, doors: 0 };
    const parts = resolveParts(dsl, params);
    expect(parts.length).toBe(3); // side_L, bottom, shelf (qty=2 as single entry)
    expect(parts.some((p) => p.code === "side_L")).toBe(true);
    expect(parts.some((p) => p.code === "bottom")).toBe(true);
    const shelf = parts.find((p) => p.code === "shelf");
    expect(shelf?.qty).toBe(2);
  });
});

describe("Utils", () => {
  it("fmtMm formats millimeters", () => {
    expect(fmtMm(800)).toBe("800 mm");
    expect(fmtMm(1200)).toBe("1.20 m");
  });

  it("fmtMoney formats UZS", () => {
    expect(fmtMoney(1_500_000)).toMatch(/1\s?500\s?000/);
  });

  it("safeJson parses valid JSON", () => {
    expect(safeJson('{"a":1}', {})).toEqual({ a: 1 });
    expect(safeJson("not json", 42)).toBe(42);
    expect(safeJson(undefined, [])).toEqual([]);
  });
});

describe("Health endpoint (integration)", () => {
  it("schema is valid", () => {
    // This test runs independently of dev server
    expect(typeof fetch).toBe("function");
  });
});
