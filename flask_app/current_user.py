class CurrentUser:
    username = None
    password = None

    def __init__(self, name = None, pwd = None):
        self.username = name
        self.password = pwd