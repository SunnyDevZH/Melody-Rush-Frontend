import usb.device
from usb.device.keyboard import KeyboardInterface, KeyCode, LEDCode
from time import sleep_ms
from collections import namedtuple

# Create named tuple for (condition callback, key)
KeyBinding = namedtuple("KeyBinding", ["condition", "key"])

class KeyboardSimulator:

    def __init__(self):
        self.bindings = []
        # NEU: Flagge, um sicherzustellen, dass nur ein Tastendruck pro Annäherung gesendet wird.
        self.trigger_sent = False
        self.keyboard = None

    def add_binding(self, condition, key):
        """
        Fügt eine Tastenbindung hinzu.
        """
        self.bindings.append(KeyBinding(condition, key))

    def start(self):
        """
        Startet den Keyboard Simulator und registriert das USB-Gerät.
        """
        self.keyboard = KeyboardInterface()
        usb.device.get().init(self.keyboard, builtin_driver=True)

    # Die separate send_keys-Funktion wird entfernt, da sie in update() integriert wird.
    
    def update(self):
        if not self.keyboard or not self.keyboard.is_open():
            return
            
        # 1. Prüfen, ob die F-Taste gedrückt werden MUSS (Bedingung erfüllt)
        # Die Logik geht davon aus, dass wir nur eine Bindung haben.
        should_press_f = any(binding.condition() for binding in self.bindings)

        # 2. Zustandswechsel: Hand nah (Trigger ON) UND Taste noch NICHT gesendet
        if should_press_f and not self.trigger_sent:
            
            # Taste DRÜCKEN
            self.keyboard.send_keys([KeyCode.F])
            sleep_ms(50) 
            
            # Taste SOFORT WIEDER LOSLASSEN (der "Tap")
            self.keyboard.send_keys([])
            
            # Trigger sperren, damit beim nächsten Schleifendurchlauf kein 'f' mehr gesendet wird
            self.trigger_sent = True 
            
        # 3. Zustandswechsel: Hand weit weg (Trigger OFF) UND Taste war gesendet
        elif not should_press_f and self.trigger_sent:
            
            # Den Sperrmechanismus zurücksetzen, um den nächsten Tastendruck zu erlauben
            self.trigger_sent = False
            
        # In allen anderen Fällen (Hand nah & gesperrt oder Hand fern & entsperrt) passiert nichts.

if __name__ == "__main__":
    from machine import Pin
    # Beispielcode (kann ignoriert werden)
    sim = KeyboardSimulator()
    btn_simulate = Pin("D2", Pin.IN)
    btn_stop = Pin("D3", Pin.IN)
    sim.add_binding(lambda: not btn_simulate.value(), KeyCode.SPACE)
    sim.start()
    
    while True:
        if btn_stop.value() == 0:
            break
        sim.update()
        sleep_ms(1)