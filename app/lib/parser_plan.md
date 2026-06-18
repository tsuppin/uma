# JRA Parser Improvements Plan

## User Feedback
The user provided a screenshot of the RaceForm where:
1. Past race data like `14着 3F 34.2` is being misidentified as a new horse (e.g. Frame 14, Number 13, Name `143F`).
2. Owner names (e.g. `(有)サンデーレーシング`, `林 正道`) are being extracted as the `Jockey`.

## Root Cause Analysis
1. **Fake Horses (`143F` etc.)**: 
   - The regex `/^\d+[\t\s]+\d+[\t\s]+[^\t\s]+/` matches any string starting with two numbers. In past race data, strings like `14 13 143F` (e.g., from `14着 13頭 14 3F` being corrupted or split) will match this regex and create a new horse block.
   - **Fix**: Restrict the `Frame` match to `^[1-8]` and `Number` to `(?:[1-9]|1[0-8])`. Add exclusions for lines containing `3F` or `着`.

2. **Owner as Jockey**:
   - The fallback logic for `Jockey` blindly takes the first non-numeric string after `kinryo`.
   - If the pasted text comes from a view that emphasizes Owner or re-orders columns, the Owner string is captured as the Jockey.
   - **Fix**: Exclude strings that contain common Owner identifiers (`(有)`, `(株)`, `レーシング`, `ホールディングス`, `ファーム`, `牧場`, `クラブ`) from being assigned to `jockey` or `trainer`. If we detect such a string, assign it to `owner` instead.

## Proposed Changes
### `app/lib/parser.ts`
- Update `blockStarts` regex logic:
  - From `/^\d+[\t\s]+\d+[\t\s]+[^\t\s]+/` 
  - To `/^[1-8][\t\s]+(?:[1-9]|1[0-8])[\t\s]+[^\t\s]+/`
  - Add `&& !l.includes("3F") && !l.includes("着")` to the exclusion list.
- Update `parseJRAHorse` jockey/owner fallback logic:
  ```typescript
    const isOwner = l.includes("(有)") || l.includes("(株)") || l.includes("レーシング") || l.includes("ファーム") || l.includes("ホールディングス") || l.includes("牧場") || l.includes("クラブ");
    if (!l.match(/\d/)) {
      if (isOwner) { owner = l; idx++; continue; }
      if (!jockey && !isOwner) { jockey = l; idx++; continue; }
      if (!trainer && !l.match(/^[栗美][東浦]$/) && !isOwner) { trainer = l; idx++; continue; }
    }
  ```
- Also, update the explicit table format jockey grabber to check `!isOwner`.
