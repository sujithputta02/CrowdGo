# Mock stub for google.cloud.firestore to clear legacy IDE warnings
class Client:
    def __init__(self, project=None): pass
    def collection(self, name): return self
    def document(self, name): return self
    def update(self, data): pass
    def set(self, data): pass
