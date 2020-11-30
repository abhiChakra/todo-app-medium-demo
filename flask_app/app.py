from flask import Flask, request, session, jsonify
from flask_cors import CORS
from flask_login import login_required, current_user, login_user, logout_user, LoginManager
from flask_bcrypt import Bcrypt
from user import UserManager
from storage import get_tasks, insert_task, delete_task

app = Flask(__name__)
app.secret_key = b'H\xcf\x85;\x0b{4\xc5\xe4y\x9f;%[;\xbb'
bcrypt = Bcrypt(app)

CORS(app, supports_credentials=True) # Enable CORS
bcrypt = Bcrypt(app) # Init Bcrypt

login_manager = LoginManager(app) # Init Flask LoginManager
user_manager = UserManager(bcrypt) # Init user-defined UserManager

@app.route('/')
def default():
    return "Todo app working!"

@login_manager.user_loader
def load_user(user_id):
    """
    This function is internally used to set up session
    It returns an User object with id = user_id or None if no user matches

    :param username: username (byte): a unicode id representing a single user.
    :return:  User (object)
    """
    return user_manager.fetch_user(user_id)

@app.route('/api/user_info', methods=['GET'])
@login_required
def retrieve_user_info():
    """
    Endpoint to get the current logged in user's id and username
    :return: jsonify({'id': id, 'username': username})
    """
    return jsonify({'user_index' : current_user.user_index, 'username' : current_user.id}), 200

@app.route('/api/login', methods=['POST'])
def login():
    # User has already logged in
    if current_user.is_authenticated:
        return jsonify(True), 200

    # Extract user input
    request_json = request.get_json()
    username = request_json['username']
    password = request_json['password']

    user = user_manager.authenticate_user(username, password)

    if not user:
        # username is not registered or wrong password
        return jsonify(False), 401

    login_user(user, remember=True)
    return jsonify(True), 200

@app.route('/api/logout', methods=['POST'])
@login_required
def logout():
    """
    This function logs the current user out
    return: str - 'true' if logout was successful
    """
    try:
        logout_user()
        return jsonify(True), 200
    except Exception as e:
        print('Error: ', e)
        return jsonify(False), 401

@app.route('/api/is_logged_in', methods=['GET'])
def logged_in():
    """
    This function checks if the current user has logged in
    :return: str - 'true' if user is logged in, 'false' otherwise
    """

    return jsonify(current_user.is_authenticated), 200

@app.route('/api/home', methods=['GET'])
@login_required
def home():
    """
    Simple message to be displayed on user home
    """
    usr_msg = 'Hello ' + current_user.id
    return jsonify(usr_msg), 200

@app.route('/api/tasks', methods=['POST'])
@login_required
def get_user_tasks():
    """
    Fetches current user's task list from DB
    """
    try:
        existing_tasks = request.get_json()['existing_tasks']
        tasks = get_tasks(current_user.user_index, existing_tasks)
        return jsonify(tasks), 200
    except:
        return jsonify('Database error in fetching tasks'), 500

@app.route('/api/add_task', methods=['POST'])
@login_required
def add_task():
    """
    Inserts a user task into the DB. 
    """
    try:
        task = request.get_json()['task']
        insert_task(current_user.user_index, task)
        return jsonify(True), 200
    except:
        return jsonify('Database insertion error in adding task'), 500

@app.route('/api/remove_task', methods=['DELETE'])
@login_required
def remove_task():
    """
    Removes a specific user task in DB
    """
    try:
        delete_task(request.get_json()['task_id'], current_user.user_index)
        return jsonify(True), 200
    except:
        return jsonify('Error interacting with DB in deleting task'), 500


if __name__ == "__main__":
    app.run('127.0.0.1', '5000', debug=True)