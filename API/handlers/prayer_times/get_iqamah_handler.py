from services.auth_service import mobile_supabase

def handle_get_iqamah():
    response = mobile_supabase.table('prayer_times').select('*').execute()
    return {"data": response.data, "error": None}
