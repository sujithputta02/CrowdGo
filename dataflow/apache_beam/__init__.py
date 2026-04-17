# Mock stub to clear IDE warnings
def Pipeline(*args, **kwargs): pass
class DoFn: 
    WindowParam = 'window'
    pass
class WindowParam: pass
def Map(fn): pass
def Filter(fn): pass
def WindowInto(window): pass
def CombineGlobally(fn): pass
class io:
    @staticmethod
    def ReadFromPubSub(topic): pass
class window:
    @staticmethod
    def FixedWindows(size): pass
    @staticmethod
    def TimestampedValue(val, ts): pass
class combiners:
    @staticmethod
    def CountCombineFn(): pass
def ParDo(fn): pass
