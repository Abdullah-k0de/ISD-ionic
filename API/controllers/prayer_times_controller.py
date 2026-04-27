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
