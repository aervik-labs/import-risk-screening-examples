# UFLPA & Denied-Party Screening API -- Quickstart

Screen a supplier or manufacturer name against the **DHS/FLETF UFLPA Entity List** and the
**Consolidated Screening List** in one request.

## Screen a party

```bash
curl -X POST "https://$RAPIDAPI_HOST/screen/shipment" \
  -H "content-type: application/json" \
  -H "X-RapidAPI-Key: $RAPIDAPI_KEY" \
  -H "X-RapidAPI-Host: $RAPIDAPI_HOST" \
  -d '{"supplier_name": "Hoshine Silicon Industry"}'
```

```python
import os, requests

resp = requests.post(
    f"https://{HOST}/screen/shipment",
    json={"supplier_name": "Hoshine Silicon Industry"},
    headers={"X-RapidAPI-Key": os.environ["RAPIDAPI_KEY"], "X-RapidAPI-Host": HOST},
)
print(resp.json())
```

**At least one party name is required** -- `supplier_name` or `manufacturer`. `hts` and
`country_of_origin` are optional and are **echoed back rather than screened**; sending only those
returns a `400`, because a screen with no party name would have checked nothing and reported clean.

## The response, from a real call

```json
{
  "input": { "supplier_name": "Hoshine Silicon Industry" },
  "coverage": "Entity records only. Records the source classifies as individuals are excluded from this service. Screen individuals at the source directly.",
  "uflpa": {
    "status": "possible_match",
    "matches": [
      {
        "matched_against": "supplier_name",
        "matched_name": "Hoshine Silicon Industry (Shanshan) Co., Ltd and subsidiaries"
      }
    ],
    "source": { "basis": "live" }
  },
  "csl": { "status": "possible_match", "matches": [ ... ] },
  "exposure_summary": { "overall_risk": "elevated", "incomplete_coverage": false }
}
```

## The failure mode to design against

**Branch on `status` and `source`, never on whether `matches` is empty.**

An empty result from a source that did not run looks exactly like a clean one. If your code reads
`matches.length === 0` and moves on, a timeout, a rate limit or an unconfigured source silently
becomes a pass.

```javascript
if (uflpa.status === 'error') {
  // NOT screened. Treat as unknown, never as clear.
}
if (uflpa.status === 'no_match' && uflpa.source.basis === 'live') {
  // Screened, and nothing found.
}
```

`exposure_summary.incomplete_coverage` is the top-level version of the same signal: `true` means
something this service intended to screen was not screened.

## Scope

**This service screens organisations, not people.** Every response carries a constant `coverage`
line saying so. Records the source classifies as individuals are excluded -- and no per-query note
tells you a person-record existed behind a name you searched, because that note would itself be
information about that person. To screen an individual, use the source directly.

**It does not classify goods.** Any `hts` you send is echoed as your input, never derived.

**A potential match is a reason to look, not a determination**, and a clean screen is not a
compliance program. It is one factual check, done fast, with its sources named.

---

*Built and operated by [Aervik Labs](https://aerviklabs.com) -- AI-operated and human-directed.*
