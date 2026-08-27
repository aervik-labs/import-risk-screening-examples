#!/usr/bin/env node
/**
 * Quickstart: US Import Risk Screening API (via RapidAPI)
 *
 * Screens a shipment's HTS code, country of origin, and (optionally) supplier/manufacturer
 * name against the UFLPA Entity List, the Consolidated Screening List (denied-party), and
 * AD/CVD case scope for that HTS + country -- in one call.
 *
 * Advisory only. A "no match" result is not a guarantee a shipment is free of exposure, and
 * this is not a customs-business determination or legal/customs advice -- consult a
 * licensed customs broker or attorney for your actual import compliance obligations.
 *
 * Setup:
 *   export RAPIDAPI_KEY="your-rapidapi-key"
 *
 * Subscribe and get your key:
 *   https://rapidapi.com/aervik-labs-aervik-labs-default/api/us-import-risk-screening-api-uflpa-ad-cvd
 *
 * Requires Node 20+ (native fetch, no dependencies).
 *
 * Usage:
 *   node quickstart.js
 */

const RAPIDAPI_HOST = 'us-import-risk-screening-api-uflpa-ad-cvd.p.rapidapi.com';
const BASE_URL = `https://${RAPIDAPI_HOST}`;

async function screenShipment({ hts, countryOfOrigin, supplierName, manufacturer }) {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) {
    console.error('Set the RAPIDAPI_KEY environment variable first -- see this file\'s header comment.');
    process.exit(1);
  }

  const payload = { hts, country_of_origin: countryOfOrigin };
  if (supplierName) payload.supplier_name = supplierName;
  if (manufacturer) payload.manufacturer = manufacturer;

  const res = await fetch(`${BASE_URL}/screen/shipment`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': RAPIDAPI_HOST,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`POST /screen/shipment failed: ${res.status} ${JSON.stringify(data)}`);
  }
  return data;
}

async function main() {
  const result = await screenShipment({
    hts: '7317.00.10',
    countryOfOrigin: 'China',
    supplierName: 'Example Supplier Co., Ltd.',
  });

  const summary = result.exposure_summary;
  console.log(`Overall risk: ${summary.overall_risk}`);
  console.log(`Narrative: ${summary.narrative}`);
  for (const reason of summary.reasons) {
    console.log(`  - ${reason}`);
  }

  if (summary.incomplete_coverage) {
    console.warn(
      '\nWARNING: one or more underlying data sources are not yet live-wired for this account. ' +
        'This result is directional only, not a complete clearance.'
    );
    for (const section of ['uflpa', 'csl', 'adcvd']) {
      const basis = result[section].source?.basis ?? 'unknown';
      const asOf = result[section].source?.as_of ?? null;
      console.warn(`  - ${section}: basis=${basis}, as_of=${asOf}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
