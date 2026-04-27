from services.auth_service import mobile_supabase

def handle_get_schedule():
    response = mobile_supabase.table('iqamah_schedule').select('*').order('effective_date').execute()
    return {"data": response.data, "error": None}
