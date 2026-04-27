import os
from supabase import create_client, Client

mobile_url = os.getenv("MOBILE_SUPABASE_URL")
mobile_key = os.getenv("MOBILE_SUPABASE_KEY")

mobile_supabase: Client = create_client(mobile_url, mobile_key)
