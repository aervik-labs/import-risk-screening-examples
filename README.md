# US Import Risk Screening API — Quickstart

CBP denied entry to over 8,000 shipments in FY2025 under the Uyghur Forced Labor
Prevention Act (UFLPA) alone, and antidumping/countervailing duties (AD/CVD) can apply
retroactively — an importer unaware a product falls under an active order can face a duty
bill that wipes out a shipment's entire margin. Checking this today means visiting the
UFLPA Entity List, the Consolidated Screening List (denied-party), and AD/CVD case data
separately, by hand, for every new supplier or SKU.

This example calls the **US Import Risk Screening API** to screen one shipment — an HTS
code, country of origin, and (optionally) a supplier/manufacturer name — against all
three sources in a single request, plus an aggregate exposure summary.

**Advisory only.** A "no match" result is not a guarantee a shipment is free of exposure,
and this is not a customs-business determination or legal/customs advice — consult a
licensed customs broker or attorney for your actual import compliance obligations. Check
each section's `source.basis` field before relying on any result.

## Setup

1. Subscribe to the API on RapidAPI:
   https://rapidapi.com/aervik-labs-aervik-labs-default/api/us-import-risk-screening-api-uflpa-ad-cvd
2. On that page, open any endpoint under the **Endpoints** tab — RapidAPI shows your
   personal `X-RapidAPI-Key` there once you're subscribed. Copy it.
3. Set it as an environment variable (never hardcode it in source):

   ```
   export RAPIDAPI_KEY="your-key-here"
   ```

## Minimal code

Python (`python/quickstart.py`, needs `pip install requests`):

```python
import os, requests

RAPIDAPI_HOST = "us-import-risk-screening-api-uflpa-ad-cvd.p.rapidapi.com"

resp = requests.post(
    f"https://{RAPIDAPI_HOST}/screen/shipment",
    json={
        "hts": "7317.00.10",
        "country_of_origin": "China",
        "supplier_name": "Example Supplier Co., Ltd.",
    },
    headers={
        "X-RapidAPI-Key": os.environ["RAPIDAPI_KEY"],
        "X-RapidAPI-Host": RAPIDAPI_HOST,
    },
)
print(resp.json())
```

Node 20+ (`node/quickstart.js`, no dependencies — uses native `fetch`):

```js
const RAPIDAPI_HOST = "us-import-risk-screening-api-uflpa-ad-cvd.p.rapidapi.com";

const res = await fetch(`https://${RAPIDAPI_HOST}/screen/shipment`, {
  method: "POST",
  headers: {
    "content-type": "application/json",
    "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
    "X-RapidAPI-Host": RAPIDAPI_HOST,
  },
  body: JSON.stringify({
    hts: "7317.00.10",
    country_of_origin: "China",
    supplier_name: "Example Supplier Co., Ltd.",
  }),
});
console.log(await res.json());
```

Run either with `RAPIDAPI_KEY=your-key python3 python/quickstart.py` or
`RAPIDAPI_KEY=your-key node node/quickstart.js`.

## Example response

```json
{
  "input": { "hts": "7317.00.10", "country_of_origin": "China", "supplier_name": "Example Supplier Co., Ltd." },
  "uflpa": { "status": "no_match", "matches": [], "source": { "basis": "live", "as_of": "2026-08-27" } },
  "csl": { "status": "no_match", "matches": [], "source": { "basis": "mock-pending-key", "as_of": null, "note": "trade.gov Developer Portal key not yet provisioned." } },
  "adcvd": { "status": "no_scope", "cases": [], "source": { "basis": "mock-pending-key", "as_of": null } },
  "exposure_summary": {
    "overall_risk": "none",
    "reasons": [],
    "narrative": "No exposure identified across the sources checked for this shipment.",
    "incomplete_coverage": true
  },
  "disclaimer": "Advisory only, not legal or customs advice..."
}
```

`overall_risk` is one of `none` / `low` / `elevated` / `high`, computed deterministically
— never by an AI model. `incomplete_coverage: true` means at least one underlying source
is not yet live-wired for your account; check each section's `source.basis` before
treating a result as a complete clearance.

## Use cases

- Screen a new supplier or SKU before placing a purchase order.
- Batch-screen a supplier list before onboarding (`POST /screen/parties`, up to 50 per
  call).
- Look up whether a specific HTS code + country combination currently falls under an
  active AD/CVD order (`GET /adcvd/by-hts/{hts}?country=`).

## More

- Full docs, pricing tiers, and the endpoint reference: the RapidAPI listing above (Docs
  tab).
- Terms of Service / full disclaimer: https://import-risk.aerviklabs.com/terms

---

Aervik Labs is an AI-native software company — an AI operating agent handles much of the
day-to-day build and support here, under human ownership. Full disclosure at the link above.
