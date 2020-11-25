import os
from configparser import ConfigParser
from ast import literal_eval
from current_user import CurrentUser

def get_user(username):
    '''
        Fetches corressponding user, if they exist, from ini file 
        :param username: str - the username to search for

        Note: Obviously in this example we are storing the
        user details in a simple ini file for brevity and 
        simplicity. In a real application these credentials
        would be securely stored within a persistent DB,
        such as GCP SQL.
    '''
    current_dir = os.path.dirname(__file__)
    filepath = os.path.join(current_dir, 'database.ini')
    parser = ConfigParser()
    parser.read(filepath)
    users_dict = literal_eval(parser['users']['USER_CREDS'])

    fetched_user_creds = users_dict.get(username)

    if(fetched_user_creds):
        return CurrentUser(username, fetched_user_creds.get('password'))
    else:
        return None