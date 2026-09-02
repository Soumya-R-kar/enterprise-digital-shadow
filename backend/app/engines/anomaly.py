import math

def detect_anomaly(current_value: float, normal_value: float):
    """
    Simple statistical anomaly detection.
    Calculates deviation percentage. If > 30%, flags as anomaly.
    """
    if normal_value == 0:
        normal_value = 1 # Prevent division by zero
        
    deviation = abs(current_value - normal_value) / normal_value
    score = min(int(deviation * 100), 100) # Cap at 100
    
    # Threshold: if metric is 30% higher/lower than normal
    is_anomaly = deviation > 0.30 
    
    return is_anomaly, score