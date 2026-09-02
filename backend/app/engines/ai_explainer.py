"""
AI EXPLANATION ENGINE
Generates natural language explanations for incidents using OpenAI GPT.
"""
import os
from openai import OpenAI

# Initialize OpenAI client
# You need to set your API key as an environment variable: OPENAI_API_KEY
# For testing, you can hardcode it here (not recommended for production)
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY", "your-api-key-here"))

def generate_incident_explanation(incident_data: dict) -> str:
    """
    Generates a natural language explanation of an incident.
    """
    prompt = f"""You are an enterprise IT operations analyst. Explain this technical incident in simple, clear language that a non-technical manager can understand.

Incident Details:
- Title: {incident_data['title']}
- Risk Score: {incident_data['risk_score']}/100
- Severity: {incident_data['severity']}
- Root Cause: {incident_data['root_cause']}
- Affected Systems: {', '.join(incident_data['affected_systems'])}
- Number of Related Events: {len(incident_data.get('timeline', []))}

Provide a 3-4 sentence explanation that:
1. Describes what is happening
2. Explains why it matters to the business
3. Suggests what should be done immediately

Keep it professional but easy to understand."""

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful IT operations analyst."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=200,
            temperature=0.7
        )
        
        explanation = response.choices[0].message.content.strip()
        return explanation
        
    except Exception as e:
        print(f"AI explanation failed: {e}")
        return "AI explanation temporarily unavailable. Please refer to the technical details above."


def generate_recommendations(incident_data: dict) -> list:
    """
    Generates AI-powered recommendations based on the incident.
    """
    prompt = f"""Based on this incident, provide 4 specific, actionable recommendations for the IT team.

Incident:
- Title: {incident_data['title']}
- Root Cause: {incident_data['root_cause']}
- Affected Systems: {', '.join(incident_data['affected_systems'])}

Provide exactly 4 recommendations, numbered 1-4. Each should be a single sentence."""

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful IT operations analyst."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=150,
            temperature=0.7
        )
        
        recommendations_text = response.choices[0].message.content.strip()
        
        # Parse numbered recommendations
        recommendations = []
        for line in recommendations_text.split('\n'):
            line = line.strip()
            if line and (line[0].isdigit() or line.startswith('-')):
                # Remove numbering
                rec = line.lstrip('0123456789.-) ').strip()
                if rec:
                    recommendations.append(rec)
        
        return recommendations[:4]  # Return max 4
        
    except Exception as e:
        print(f"AI recommendations failed: {e}")
        return [
            "Investigate the root cause immediately.",
            "Monitor affected systems closely.",
            "Communicate impact to stakeholders.",
            "Prepare rollback plan if needed."
        ]