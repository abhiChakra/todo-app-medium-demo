from flask_login import UserMixin, current_user
from storage import get_user
from db_user import DBUser

class User(UserMixin):
    """ Used to represent a single user.
       Public Attributes:
        id (str): unique id for identifying User. used in the parent class UserMixin, should be the same as username
        user_index (int): user index, used for SQL operations
        password (str): hashed key
    """

    def __init__(self, username, index, password):
        """
        initialize a user with username and level from user manager
        :param username: str - the user name
        :param password: str - user password
        """
        self.id = username
        self.user_index = index
        self.password = password

    def __repr__(self):
        return '<User {}>'.format(self.id)


class UserManager:
    """
    a class to generate users
    """

    def __init__(self, bcrypt):
        """
        create a user_manager class with DBUser Object
        :param DBUser: object ('username','password','levell)
        """
        self.bcrypt = bcrypt

    def fetch_user(self, username):
        """
        return User() if username exists in db, otherwise None
        :param username: str - the username
        :return: User object/None
        """
        try:
            found_user = get_user(username)
            if isinstance(found_user, DBUser):
                return User(found_user.username, found_user.id, found_user.password)
            return None
        except:
            return None

    def authenticate_user(self, username, password):
        """
        verify a user with username and password
        :param username: string - username
        :param password: string - the password
        :return: User|None - a user object if user get verified or None in else case
        """
        user = self.fetch_user(username)
        if user:
            is_auth = self.bcrypt.check_password_hash(user.password, password)
            if is_auth:
                return user
        return None