import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

# Email configuration (use environment variables in production)
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "your-email@gmail.com")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "your-app-password")
FROM_EMAIL = os.getenv("FROM_EMAIL", "your-email@gmail.com")

def send_email_notification(to_email: str, subject: str, body: str):
    """Send email notification."""
    try:
        msg = MIMEMultipart()
        msg['From'] = FROM_EMAIL
        msg['To'] = to_email
        msg['Subject'] = subject
        
        msg.attach(MIMEText(body, 'html'))
        
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        
        print(f"✅ Email sent to {to_email}")
        return True
    except Exception as e:
        print(f"❌ Failed to send email: {e}")
        return False

def notify_critical_incident(incident_data: dict, recipients: list):
    """Send notification for critical incidents."""
    subject = f"🚨 CRITICAL: {incident_data['title']}"
    
    body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #dc2626;">Critical Incident Detected</h2>
        <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
            <p><strong>Incident:</strong> {incident_data['title']}</p>
            <p><strong>Risk Score:</strong> {incident_data['risk_score']}/100</p>
            <p><strong>Severity:</strong> {incident_data['severity']}</p>
            <p><strong>Root Cause:</strong> {incident_data['root_cause']}</p>
            <p><strong>Affected Systems:</strong> {', '.join(incident_data['affected_systems'])}</p>
        </div>
        <p>Please investigate immediately.</p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
            This is an automated notification from Enterprise Digital Shadow.
        </p>
    </body>
    </html>
    """
    
    for recipient in recipients:
        send_email_notification(recipient, subject, body)