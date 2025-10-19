import random
import psycopg2
import smtplib
from email.mime.text import MIMEText
from datetime import datetime, timedelta
import sys
import os

# Database connection details (from application.properties)
DB_HOST = "localhost"
DB_PORT = "5432"
DB_NAME = "biovault"
DB_USER = "biovault_user"
DB_PASSWORD = "biovault"

# Email settings (configure as needed, e.g., Gmail)
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USER = "biovault1@gmail.com"  # Your updated email
SMTP_PASSWORD = "ljet suqy uwxf ryyh"  # Your updated app password

def generate_otp():
    return str(random.randint(100000, 999999))

def send_email(to_email, otp):
    msg = MIMEText(f"Your OTP for BioVault login is: {otp}. It expires in 5 minutes.")
    msg['Subject'] = "BioVault OTP"
    msg['From'] = SMTP_USER
    msg['To'] = to_email

    try:
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.sendmail(SMTP_USER, to_email, msg.as_string())
        server.quit()
        print("Email sent successfully")
    except Exception as e:
        print(f"Failed to send email: {e}")
        sys.exit(1)

def update_user_otp(email, otp):
    expiry = datetime.now() + timedelta(minutes=5)
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD
        )
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE users SET otp = %s, otp_expiry = %s WHERE email = %s
        """, (otp, expiry, email))
        conn.commit()
        cursor.close()
        conn.close()
        print("OTP updated in DB")
    except Exception as e:
        print(f"DB update failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python otp_script.py <email>")
        sys.exit(1)

    email = sys.argv[1]
    otp = generate_otp()
    update_user_otp(email, otp)
    send_email(email, otp)
    print(f"OTP {otp} generated and sent to {email}")