#!/usr/bin/env python3
"""
Quickstart: US Import Risk Screening API (via RapidAPI)

Screens a shipment's HTS code, country of origin, and (optionally) supplier/manufacturer
name against the UFLPA Entity List, the Consolidated Screening List (denied-party), and
AD/CVD case scope for that HTS + country -- in one call.

Advisory only. A "no match" result is not a guarantee a shipment is free of exposure, and
this is not a customs-business determination or legal/customs advice -- consult a
licensed customs broker or attorney for your actual import compliance obligations.

Setup:
    pip install requests
    export RAPIDAPI_KEY="your-rapidapi-key"

Subscribe and get your key:
    https://rapidapi.com/aervik-labs-aervik-labs-default/api/us-import-risk-screening-api-uflpa-ad-cvd

Usage:
    python3 quickstart.py
"""
import os
import sys
from typing import Optional

import requests

RAPIDAPI_HOST = "us-import-risk-screening-api-uflpa-ad-cvd.p.rapidapi.com"
BASE_URL = f"https://{RAPIDAPI_HOST}"


def screen_shipment(hts: str, country_of_origin: str, supplier_name: Optional[str] = None,
                     manufacturer: Optional[str] = None) -> dict:
    api_key = os.environ.get("RAPIDAPI_KEY")
    if not api_key:
        sys.exit("Set the RAPIDAPI_KEY environment variable first -- see this script's docstring.")

    payload: dict = {"hts": hts, "country_of_origin": country_of_origin}
    if supplier_name:
        payload["supplier_name"] = supplier_name
    if manufacturer:
        payload["manufacturer"] = manufacturer

    resp = requests.post(
        f"{BASE_URL}/screen/shipment",
        json=payload,
        headers={
            "X-RapidAPI-Key": api_key,
            "X-RapidAPI-Host": RAPIDAPI_HOST,
        },
        timeout=15,
    )
    resp.raise_for_status()
    return resp.json()


def main() -> None:
    result = screen_shipment(
        hts="7317.00.10",
        country_of_origin="China",
        supplier_name="Example Supplier Co., Ltd.",
    )

    summary = result["exposure_summary"]
    print(f"Overall risk: {summary['overall_risk']}")
    print(f"Narrative: {summary['narrative']}")
    for reason in summary["reasons"]:
        print(f"  - {reason}")

    if summary.get("incomplete_coverage"):
        print("\nWARNING: one or more underlying data sources are not yet live-wired for this")
        print("account. This result is directional only, not a complete clearance.")
        for section in ("uflpa", "csl", "adcvd"):
            basis = result[section]["source"].get("basis", "unknown")
            as_of = result[section]["source"].get("as_of")
            print(f"  - {section}: basis={basis}, as_of={as_of}")


if __name__ == "__main__":
    main()
