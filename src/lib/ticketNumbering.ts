/**
 * Ticket Numbering Utilities
 *
 * Ticket numbers follow the pattern n-n-n-n where each segment (n) is either:
 *  - a number  → the ticket must be performed in that specific order
 *  - a letter  → the ticket may be performed in any order (parallel to siblings)
 *
 * Examples:
 *  "1"       – first ordered step
 *  "2"       – second ordered step
 *  "2-a"     – first parallel branch under step 2
 *  "2-b"     – second parallel branch under step 2
 *  "3-1"     – first sub-step of step 3
 *  "3-1-a"   – first parallel sub-branch under 3-1
 */

/** Returns true when the segment represents an unordered (parallel) step. */
export function isParallelSegment(segment: string): boolean {
  return /^[a-z]+$/i.test(segment);
}

/** Returns true when the segment represents an ordered step. */
export function isOrderedSegment(segment: string): boolean {
  return /^\d+$/.test(segment);
}

/** Parses a ticket sequence string into its individual segments. */
export function parseSequence(sequence: string): string[] {
  return sequence.split("-").filter((s) => s.length > 0);
}

/** Builds a sequence string from individual segments. */
export function buildSequence(segments: string[]): string {
  return segments.join("-");
}

/**
 * Converts a 0-based numeric index to a letter-based label.
 * 0 → 'a', 1 → 'b', …, 25 → 'z', 26 → 'aa', etc.
 */
export function indexToLetter(index: number): string {
  let result = "";
  let n = index;
  do {
    result = String.fromCharCode(97 + (n % 26)) + result;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return result;
}

/**
 * Converts a letter-based label back to a 0-based numeric index.
 * 'a' → 0, 'b' → 1, …, 'z' → 25, 'aa' → 26, etc.
 */
export function letterToIndex(letter: string): number {
  let result = 0;
  for (let i = 0; i < letter.length; i++) {
    result = result * 26 + (letter.toLowerCase().charCodeAt(i) - 96);
  }
  return result - 1;
}

export interface TicketNode {
  id: number;
  subject: string;
  sequence: string;
  /** Whether this ticket is parallel to its siblings (uses letter segment). */
  isParallel: boolean;
  children: TicketNode[];
}

/**
 * Renumbers an array of ticket sequences so they are contiguous and correctly
 * ordered.  Sequences at the same depth that use letter-segments are kept as
 * letters; sequences that use number-segments are renumbered starting at 1.
 *
 * @param sequences - Current sequence strings in display order.
 * @returns New sequence strings in the same order.
 */
export function renumberSequences(sequences: string[]): string[] {
  if (sequences.length === 0) return [];

  // Group sequences by their depth-0 number prefix so we can renumber within
  // each top-level group independently.
  //
  // Strategy:
  //   1. Walk through sequences in order, collecting top-level "groups".
  //      A group starts whenever a new top-level ORDERED segment is seen,
  //      or whenever we encounter a top-level PARALLEL segment.
  //   2. Renumber ordered segments sequentially (1, 2, 3, …).
  //   3. Within a group sharing the same ordered prefix, renumber any
  //      parallel second-level letters (a, b, c, …).

  const result: string[] = new Array(sequences.length);

  let orderedCounter = 0;
  let i = 0;

  while (i < sequences.length) {
    const segs = parseSequence(sequences[i]);
    const topSeg = segs[0];

    if (isOrderedSegment(topSeg)) {
      orderedCounter += 1;
      const newTopSeg = String(orderedCounter);

      // Collect all consecutive sequences that share this same original
      // top-level segment so we can renumber their sub-segments together.
      const groupStart = i;
      const originalTop = topSeg;

      // Advance while entries still belong to this top-level group.
      while (
        i < sequences.length &&
        parseSequence(sequences[i])[0] === originalTop
      ) {
        const s = parseSequence(sequences[i]);
        const newSegs = [newTopSeg, ...s.slice(1)];
        result[i] = buildSequence(newSegs);
        i++;
      }

      // Now renumber second-level segments within the group if they are
      // parallel (letters).
      let letterIdx = 0;
      for (let j = groupStart; j < i; j++) {
        const s = parseSequence(result[j]);
        if (s.length >= 2 && isParallelSegment(s[1])) {
          const newSegs = [s[0], indexToLetter(letterIdx), ...s.slice(2)];
          result[j] = buildSequence(newSegs);
          letterIdx++;
        }
      }
    } else if (isParallelSegment(topSeg)) {
      // Top-level parallel segment: renumber with letters.
      // Collect the run of consecutive top-level letter segments.
      const groupStart = i;
      while (
        i < sequences.length &&
        isParallelSegment(parseSequence(sequences[i])[0])
      ) {
        i++;
      }
      let letterIdx = 0;
      for (let j = groupStart; j < i; j++) {
        const s = parseSequence(sequences[j]);
        const newSegs = [indexToLetter(letterIdx), ...s.slice(1)];
        result[j] = buildSequence(newSegs);
        letterIdx++;
      }
    } else {
      result[i] = sequences[i];
      i++;
    }
  }

  return result;
}
