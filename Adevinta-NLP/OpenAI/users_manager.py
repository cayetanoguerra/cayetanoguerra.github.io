import user

class UsersManager:
    def __init__(self):
        self.users = {}

    def get_user(self, user_id):
        if user_id in self.users:
            return self.users[user_id]
        else:
            new_user = user.User(user_id)
            self.users[user_id] = new_user
            return new_user

    def remove_user(self, user_id):
        if user_id in self.users:
            del self.users[user_id]
        else:
            pass