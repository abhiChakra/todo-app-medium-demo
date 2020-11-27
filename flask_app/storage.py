import os
from configparser import ConfigParser
from ast import literal_eval
from db_user import DBUser
from sqlalchemy import create_engine, exc

PARSER_CONNECTION = "to-do-app-cloud-postgres"

def read_config():
    '''
        Instantiating a config file reader for our use case.
        To be used to read credentials for connecting to PSQL
        DB hosted in GCP SQL.
    :return: ConfigParser
    '''

    current_dir = os.path.dirname(__file__)
    file_path = os.path.join(current_dir, 'database.ini')

    config = ConfigParser()
    config.read(file_path)

    return config

def connection_uri():
    '''
        Creating connection URI for connecting to PSQL DB. URI will
        be used to create SQLAlchemy engine for executing queries.
        :return: URI for our PSQL DB hosted in GCP SQL
    '''
    config = read_config()

    URI = 'postgresql+psycopg2://{}:{}@/{}?host={}'.format(
        config[PARSER_CONNECTION]['user'],
        config[PARSER_CONNECTION]['password'],
        config[PARSER_CONNECTION]['dbname'],
        config[PARSER_CONNECTION]['host']
    )

    return URI

def create_users_table():
    """
    Creates table 'users' with 2 attributes:
        - username (varchar)
        - password (varchar hashed)
    :return: None
    """
    
    URI = connection_uri()
    my_connection = None
    TABLE_NAME = "users"

    CREATE_USERS_TABLE_QUERY = """
        CREATE TABLE IF NOT EXISTS {} (
            id SERIAL PRIMARY KEY,
            username VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL
        );""".format(TABLE_NAME)

    try:
        engine = create_engine(URI, echo=False)
        connection = engine.connect()
        connection.execute(CREATE_USERS_TABLE_QUERY)

    except exc.SQLAlchemyError as err:
        error_message = 'Error occurred while creating table {}. Exception: {}'.format(TABLE_NAME, err)
        raise Exception(error_message)

    finally:
        connection.close()
        engine.dispose()

def create_tasks_table():
    '''
        Function used to create an SQL table for inserting our
        user's tasks into. We are using SQLAlchemy's DB engine
        for executing our created query.
    :return:
    '''

    URI = connection_uri()
    my_connection = None
    TABLE_NAME = "tasks"

    CREATE_TABLE_QUERY = """
                    CREATE TABLE IF NOT EXISTS {} (
                        id SERIAL,
                        user_id INT NOT NULL REFERENCES users(id),
                        task VARCHAR(255) NOT NULL,
                        PRIMARY KEY(id, user_id)
                    )""".format(TABLE_NAME)
    
    try:
        engine = create_engine(URI, echo=False)
        my_connection = engine.connect()
        my_connection.execute(CREATE_TABLE_QUERY)

        return "Table created successfully"

    except exc.SQLAlchemyError as error:
        error_message = 'Error trying to create table: {}'.format(error)
        raise Exception(error_message)

    finally:
        my_connection.close()
        engine.dispose()

def insert_users(usrObjs):
    '''
    Function used to insert a user's creds into DB
    :param usrObj: a list of DBUser objects
    '''
    URI = connection_uri()
    my_connection = None

    try:
        engine = create_engine(URI, echo=True)
        my_connection = engine.connect()

        for user in usrObjs:
            my_connection.execute('INSERT INTO users (username, password) VALUES (%s, %s)', (user.username, user.password))

        return "Insertion successful"

    except exc.SQLAlchemyError as err:
        error_message = 'Error occured inserting into table {}. Exception: {}'.format("users", err)
        raise Exception(error_message)

    finally:
        my_connection.close()
        engine.dispose()


def insert_task(user_id, task_string):
    '''
    Function used to insert a user's task into the DB.
    :param user_id: unique id of user creating task
    :param task_string: task title
    :return: error or success strings for inserting into DB.
    '''
    URI = connection_uri()
    my_connection = None

    try:
        engine = create_engine(URI, echo=True)
        my_connection = engine.connect()

        my_connection.execute('INSERT INTO tasks (user_id, task) VALUES (%s, %s)', (user_id, task_string))
        return "Insertion successful"

    except exc.SQLAlchemyError as err:
        error_message = 'Error occured inserting into table {}. Exception: {}'.format("tasks", err)
        raise Exception(error_message)

    finally:
        my_connection.close()
        engine.dispose()

def get_tasks(user_id, existing_tasks={}):
    '''
    Function used to fetch a user's current tasks from PSQL DB.
    existing_tasks is an optional argument to filter and return 
    only new tasks
    :param user_id: index of user whose tasks to look up
    :param existing_tasks, optional dictionary of tasks to filter out
    :return: list of tasks
    '''

    URI = connection_uri()
    my_connection = None
    
    GET_TASKS_QUERY = """
                        SELECT id, task FROM tasks WHERE tasks.user_id = {}
                      """.format(user_id)

    try:
        engine = create_engine(URI, echo=False)
        my_connection = engine.connect()

        tasks = my_connection.execute(GET_TASKS_QUERY)


        user_tasks = {}
        for row in tasks:
            if str(row['id']) not in existing_tasks:
                user_tasks[row['id']] = row['task']
        
        return user_tasks

    except exc.SQLAlchemyError as err:
        error_message = 'Error fetching from table {}. Exception: {}'.format("tasks", err)
        raise Exception(error_message)

    finally:
        my_connection.close()
        engine.dispose()


def delete_task(task_id, user_id):
    '''
    Function used to delete a user's task from tasks DB.
    :param task_id: id of task to be deleted
    :param user_id: id of user whose task it is which must be deleted
    :return: string message on whether deleted successfully or not
    '''

    URI = connection_uri()
    my_connection = None

    try:
        engine = create_engine(URI, echo=False)
        my_connection = engine.connect()
        my_connection.execute('DELETE from tasks WHERE user_id = {} AND id = {}'.format(user_id, task_id))
        return "Deletion successful"
    except exc.SQLAlchemyError as err:
        error_message = 'Error deleting data from table {}. Exception: {}'.format("tasks", err)
        raise Exception(error_message)

    finally:
        my_connection.close()
        engine.dispose()

def get_user(username):
    '''
        Fetches corressponding user, if they exist, from users table
        :param username: str - the username to search for
    '''

    URI = connection_uri()
    my_connection = None
    
    GET_USER_QUERY = """
                        SELECT * FROM users WHERE username = '{}';
                      """.format(username)

    try:
        engine = create_engine(URI, echo=False)
        my_connection = engine.connect()

        user = my_connection.execute(GET_USER_QUERY).first()

        if user:
            return DBUser(user['id'], user['username'], user['password'])
        else:
            return None

    except exc.SQLAlchemyError as err:
        error_message = 'Error fetching from table {}. Exception: {}'.format("users", err)
        raise Exception(error_message)

    finally:
        my_connection.close()
        engine.dispose()

# if __name__ == "__main__":
#     create_users_table()

#     parser = read_config()
#     users_dict = literal_eval(parser['users']['USER_CREDS'])

#     #Users:
#     users = []
#     for user in users_dict.keys():
#         new_user = DBUser(None, user, users_dict[user]['password'])
#         users.append(new_user)
#     insert_users(users)

#     create_tasks_table()
#     insert_task(1, "get groceries")
#     insert_task(2, "do laundry")
#     insert_task(1, "call dentist")
#     insert_task(2, "order monitor")
#     insert_task(1, "call Stacy")
#     delete_task(1, 1)