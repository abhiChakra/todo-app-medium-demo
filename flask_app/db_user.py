class DBUser:
    """
    Representing a user for ease of operations on DB
    """
    id = None
    username = None
    password = None

    def __init__(self, user_id = None, name = None, pwd = None):
        self.id = user_id
        self.username = name
        self.password = pwd