import {
  isParallelSegment,
  isOrderedSegment,
  indexToLetter,
  letterToIndex,
  parseSequence,
  buildSequence,
  renumberSequences,
} from "@/lib/ticketNumbering";

describe("isParallelSegment", () => {
  it("returns true for lowercase letters", () => {
    expect(isParallelSegment("a")).toBe(true);
    expect(isParallelSegment("z")).toBe(true);
    expect(isParallelSegment("abc")).toBe(true);
  });

  it("returns true for uppercase letters", () => {
    expect(isParallelSegment("A")).toBe(true);
    expect(isParallelSegment("AB")).toBe(true);
  });

  it("returns false for numbers", () => {
    expect(isParallelSegment("1")).toBe(false);
    expect(isParallelSegment("42")).toBe(false);
  });

  it("returns false for mixed", () => {
    expect(isParallelSegment("a1")).toBe(false);
  });
});

describe("isOrderedSegment", () => {
  it("returns true for integers", () => {
    expect(isOrderedSegment("1")).toBe(true);
    expect(isOrderedSegment("99")).toBe(true);
  });

  it("returns false for letters", () => {
    expect(isOrderedSegment("a")).toBe(false);
  });

  it("returns false for mixed", () => {
    expect(isOrderedSegment("1a")).toBe(false);
  });
});

describe("indexToLetter", () => {
  it("converts 0 to 'a'", () => expect(indexToLetter(0)).toBe("a"));
  it("converts 25 to 'z'", () => expect(indexToLetter(25)).toBe("z"));
  it("converts 26 to 'aa'", () => expect(indexToLetter(26)).toBe("aa"));
  it("converts 51 to 'az'", () => expect(indexToLetter(51)).toBe("az"));
  it("converts 52 to 'ba'", () => expect(indexToLetter(52)).toBe("ba"));
});

describe("letterToIndex", () => {
  it("converts 'a' to 0", () => expect(letterToIndex("a")).toBe(0));
  it("converts 'z' to 25", () => expect(letterToIndex("z")).toBe(25));
  it("converts 'aa' to 26", () => expect(letterToIndex("aa")).toBe(26));
  it("is inverse of indexToLetter", () => {
    for (let i = 0; i < 60; i++) {
      expect(letterToIndex(indexToLetter(i))).toBe(i);
    }
  });
});

describe("parseSequence / buildSequence", () => {
  it("parses simple sequence", () => {
    expect(parseSequence("1")).toEqual(["1"]);
    expect(parseSequence("2-a")).toEqual(["2", "a"]);
    expect(parseSequence("1-2-a-3")).toEqual(["1", "2", "a", "3"]);
  });

  it("round-trips", () => {
    const segs = ["1", "2", "a", "3"];
    expect(parseSequence(buildSequence(segs))).toEqual(segs);
  });
});

describe("renumberSequences", () => {
  it("returns empty array for empty input", () => {
    expect(renumberSequences([])).toEqual([]);
  });

  it("renumbers simple ordered sequence starting from 1", () => {
    expect(renumberSequences(["3", "5", "7"])).toEqual(["1", "2", "3"]);
  });

  it("renumbers ordered sequence that already starts at 1", () => {
    expect(renumberSequences(["1", "2", "3"])).toEqual(["1", "2", "3"]);
  });

  it("renumbers parallel sub-sequences", () => {
    // 2-a, 2-b should stay as a, b under their new top number
    const input = ["1", "2-a", "2-b", "3"];
    const result = renumberSequences(input);
    expect(result[0]).toBe("1");
    expect(result[1]).toBe("2-a");
    expect(result[2]).toBe("2-b");
    expect(result[3]).toBe("3");
  });

  it("renumbers parallel sub-sequences after gap", () => {
    // If the ordered top counter is already 1 (was "5"), parallel letters reset
    const input = ["5-a", "5-b", "5-c"];
    const result = renumberSequences(input);
    // All share same original top → numbered 1 with letters a, b, c
    expect(result[0]).toBe("1-a");
    expect(result[1]).toBe("1-b");
    expect(result[2]).toBe("1-c");
  });

  it("renumbers a realistic sprint flow", () => {
    // Sprint: setup, parallel tasks (analysis-a, analysis-b), implement, test
    const input = ["1", "2-a", "2-b", "3", "4"];
    const result = renumberSequences(input);
    expect(result).toEqual(["1", "2-a", "2-b", "3", "4"]);
  });

  it("renumbers top-level parallel steps with letters", () => {
    const input = ["a", "b", "c"];
    const result = renumberSequences(input);
    expect(result).toEqual(["a", "b", "c"]);
  });

  it("handles single ticket", () => {
    expect(renumberSequences(["7"])).toEqual(["1"]);
  });

  it("handles reordering — after drag, renumber fixes the sequence", () => {
    // Original: 1, 2, 3. User dragged "3" to position 0 → ["3", "1", "2"]
    const input = ["3", "1", "2"];
    const result = renumberSequences(input);
    expect(result).toEqual(["1", "2", "3"]);
  });
});
