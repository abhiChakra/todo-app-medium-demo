class DBUser:
    id = None
    username = None
    password = None

    def __init__(self, user_id = None, name = None, pwd = None):
        self.id = user_id
        self.username = name
        self.password = pwd