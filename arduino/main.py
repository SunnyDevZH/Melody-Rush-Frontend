from keyboard_simulator import KeyboardSimulator # Importiert die korrigierte Klasse
from usb.device.keyboard import KeyCode
import time
from modulino import ModulinoDistance, ModulinoPixels

# =========================
# Konfiguration
# =========================
DRUCK_SCHWELLE_CM = 10 
NUM_LEDS = 8
FARBE_TASTENDRUCK = (255, 0, 0) # Rot
FARBE_BEREIT = (0, 0, 0)       # Aus

# =========================
# Initialisierung
# =========================
dist = ModulinoDistance()
pixels = ModulinoPixels()

for i in range(NUM_LEDS):
    pixels.set_rgb(i, *FARBE_BEREIT)
pixels.show()

# =========================
# Tastatur- und LED-Logik
# =========================

def should_press_f():
    """
    Die Bedingung, unter der die Taste 'F' gedrückt werden soll.
    """
    distance_cm = dist.distance
    
    if 0 < distance_cm <= DRUCK_SCHWELLE_CM:
        return True
    return False

def update_leds_for_keypress(is_triggered):
    """
    Aktualisiert die LEDs als visuellen Indikator für den Tastendruck.
    """
    farbe = FARBE_TASTENDRUCK if is_triggered else FARBE_BEREIT
        
    for i in range(NUM_LEDS): 
        pixels.set_rgb(i, *farbe)
    pixels.show()

# =========================
# Keyboard Simulator starten
# =========================
keyboard = KeyboardSimulator()
keyboard.add_binding(should_press_f, KeyCode.A) 

# WICHTIG: DIESER BEFEHL TRENNT DIE SERIELLE VERBINDUNG!
keyboard.start() 

# =========================
# Hauptschleife
# =========================
while True:
    
    trigger_state = should_press_f()
    
    update_leds_for_keypress(trigger_state)
    
    # Sendet den Tastendruck (Einzelschuss-Logik in KeyboardSimulator.update())
    keyboard.update() 
    
    time.sleep_ms(10)