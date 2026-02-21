import random
from app.models.schemas import RoundInput


def simulate_cap_table(founder_equity: float, rounds: list[RoundInput]) -> dict:
    """
    Simulate equity dilution across funding rounds.
    Final Equity = Initial Equity × (1 - Dilution Ratio)
    """
    equity = founder_equity
    history = [{"round": "Founders", "equity": round(equity, 2), "dilution": 0.0, "valuation": 0.0}]

    for r in rounds:
        post_money = r.pre_money_valuation + r.investment
        dilution_ratio = r.investment / post_money
        equity = equity * (1 - dilution_ratio)
        history.append({
            "round": r.name,
            "equity": round(equity, 2),
            "dilution": round(dilution_ratio * 100, 2),
            "investment": r.investment,
            "pre_money": r.pre_money_valuation,
            "post_money": post_money,
            "investor_equity": round(dilution_ratio * 100, 2),
        })

    return {
        "final_founder_equity": round(equity, 2),
        "total_dilution": round(founder_equity - equity, 2),
        "rounds": history,
    }
