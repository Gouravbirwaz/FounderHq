import random
import hashlib


# Mock MCA verification — in production this calls DigiLocker/MCA21 APIs
_VERIFIED_COMPANIES = {
    "razorpay", "zepto", "meesho", "slice", "cred", "groww", "navi", "vedantu",
    "unacademy", "byjus", "freshworks", "zoho", "oyo", "paytm", "phonepe",
}


def mock_verify_startup(company_name: str) -> dict:
    name_lower = company_name.lower().strip()

    # Deterministic pseudo-random based on company name hash
    seed = int(hashlib.md5(name_lower.encode()).hexdigest(), 16) % 100
    verified = name_lower in _VERIFIED_COMPANIES or seed > 30  # 70% pass rate for demo

    return {
        "company": company_name,
        "verified": verified,
        "cin": f"U72900MH2023PTC{seed:06d}" if verified else None,
        "incorporation_date": "2021-07-15" if verified else None,
        "registered_state": "Maharashtra" if verified else None,
        "mca_status": "Active" if verified else "Not Found",
        "badge_level": "Gold" if verified else None,
        "message": (
            "Verification successful. MCA records confirmed. Your vetting badge has been activated."
            if verified
            else "Company not found in MCA records. Please ensure your company is registered."
        ),
    }
