def calculate_risk(likelihood, impact):
    """
    Risk Score = Likelihood x Impact

    Both likelihood and impact are rated from 1 to 5.
    Therefore the possible risk score ranges from 1 to 25.
    """

    likelihood = int(likelihood)
    impact = int(impact)

    if not 1 <= likelihood <= 5:
        raise ValueError("Likelihood must be between 1 and 5.")

    if not 1 <= impact <= 5:
        raise ValueError("Impact must be between 1 and 5.")

    score = likelihood * impact

    if score <= 4:
        level = "Low"
    elif score <= 9:
        level = "Medium"
    elif score <= 16:
        level = "High"
    else:
        level = "Critical"

    return score, level


def calculate_residual_risk(residual_likelihood, residual_impact):
    """
    Calculate residual risk score and severity based on residual likelihood and impact.
    Score = Likelihood * Impact
    1–4 = Low
    5–9 = Medium
    10–16 = High
    17–25 = Critical
    """
    return calculate_risk(residual_likelihood, residual_impact)