import usb.device
from usb.device.keyboard import KeyboardInterface, KeyCode
from time import sleep_ms
from collections import namedtuple

# Create named tuple for (condition callback, key)
KeyBinding = namedtuple("KeyBinding", ["condition", "key"])

class KeyboardEmulator:

    def __init__(self):
        self.bindings = []
        self.keys = []  # Keys held down, reuse the same list object
        self.prev_keys = [None]  # Previous keys, starts with a dummy value so first iteration will always send
        self.keyboard = None

    def add_binding(self, condition, key):
        """
        Add a key binding.

        :param condition: A callable that returns True when the key should be pressed.
        :param key: The key to press when the condition is met. e.g. KeyCode.SPACE
        """
        self.bindings.append(KeyBinding(condition, key))

    def start(self):
        """
        Start the keyboard simulator. This will register the USB keyboard device.
        """
        # Register the keyboard interface and re-enumerate
        self.keyboard = KeyboardInterface()
        usb.device.get().init(self.keyboard, builtin_driver=True)

    def send_keys(self, key_codes):
        """
        Standalone method to send key codes immediately.
        """
        if not self.keyboard.is_open():
            return        
        self.keyboard.send_keys(key_codes)
        sleep_ms(150) # Short delay to simulate key press
        self.keyboard.send_keys([])  # Release keys

    def update(self):
        if not self.keyboard.is_open():
            return
        
        self.keys.clear()

        # Populate the keys list based on the associated conditions
        for binding in self.bindings:
            if binding.condition():
                self.keys.append(binding.key)

        # Only send keys if there is a change
        if self.keys != self.prev_keys:
            self.keyboard.send_keys(self.keys)
            self.prev_keys.clear()
            self.prev_keys.extend(self.keys)