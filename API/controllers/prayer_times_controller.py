from flask import Blueprint, jsonify
from handlers.prayer_times.get_iqamah_handler import handle_get_iqamah
from handlers.prayer_times.get_schedule_handler import handle_get_schedule

prayer_times_blueprint = Blueprint('prayer_times', __name__, url_prefix='/api/prayer-times')

@prayer_times_blueprint.route('/iqamah', methods=['GET'])
def get_iqamah():
    result = handle_get_iqamah()
    return jsonify(result)

@prayer_times_blueprint.route('/schedule', methods=['GET'])
def get_schedule():
    result = handle_get_schedule()
    return jsonify(result)

@prayer_times_blueprint.route('/all', methods=['GET'])
def get_all_prayer_data():
    iqamah_result = handle_get_iqamah()
    schedule_result = handle_get_schedule()
    
    return jsonify({
        "data": {
            "iqamah": iqamah_result.get("data", []) if isinstance(iqamah_result, dict) else iqamah_result,
            "schedule": schedule_result.get("data", []) if isinstance(schedule_result, dict) else schedule_result
        },
        "error": iqamah_result.get("error") if isinstance(iqamah_result, dict) and iqamah_result.get("error") else (schedule_result.get("error") if isinstance(schedule_result, dict) else None)
    })
