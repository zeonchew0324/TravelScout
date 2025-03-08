import datetime

class Chat():
    def __init__(self, session_id, messages):
        self.messages = messages
        self.session_id = session_id

    def to_database_format(self):
        return {
            'session_id': self.session_id,
            'messages': [message.to_database_format() for message in self.messages]
        }

class Message():
    def __init__(self, sender, content, timestamp=datetime.datetime.now().isoformat()):
        self.sender = sender
        self.content = content
        self.timestamp = timestamp

    def to_database_format(self):
        return {
            'sender': self.sender,
            'content': self.content,
            'timestamp': self.timestamp
        }