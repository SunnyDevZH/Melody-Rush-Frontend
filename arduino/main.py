from keyboard_emulator import KeyboardEmulator                              # Code von Sebastian zur Steuerung der Tastatur
from usb.device.keyboard import KeyCode                                     # Code auf Board zur Tastatursteuerung
from time import sleep_ms                                                   # timer
from modulino import ModulinoDistance, ModulinoPixels                       # Import Modulino Module
from machine import I2C, SoftI2C, Pin                                       # I2C Busse für mehrere Sensoren

# =========================
# Konfiguration
# =========================
MIN_AKTIV_CM = 0                                                            # Untere Grenze für Aktivierung
MAX_AKTIV_CM = 15                                                           # Obere Grenze für Aktivierung
NUM_LEDS = 8                                                                # Anzahl der LEDs auf dem Modulino
LED_FARBE = (0, 0, 255)                                                     # Farbe Blau
LED_AUS = (0, 0, 0)                                                         # LED aus
MAX_GUELTIGE_DISTANZ_CM = MAX_AKTIV_CM                                      # Messwerte darüber ignorieren (Ausreisser)

# =========================
# Hilfsfunktionen (Initialisierung Pixels und Distanzsensoren)
# =========================
def try_init_distance(bus, label):
    try:
        return ModulinoDistance(bus)                                        # Überprüfung ob Distanzsensor verbunden ist
    except Exception as e:
        print("[WARN] Distanzsensor", label, "Init fehlgeschlagen:", e)
        return None

def try_init_pixels(bus, label, num_leds, led_aus):
    try:
        p = ModulinoPixels(bus)                                             # Überprüfung ob Pixels-Modul verbunden ist
        for i in range(num_leds):
            p.set_rgb(i, *led_aus)
        p.show()
        return p
    except Exception as e:
        print("[WARN] Pixels", label, "Init fehlgeschlagen:", e)
        return None

# =========================
# Initialisierung Module und LEDs aus
# =========================

# Pin-Konfiguration für G1-G4
g1_scl = Pin("RX", Pin.OPEN_DRAIN, Pin.PULL_UP)
g1_sda = Pin("TX", Pin.OPEN_DRAIN, Pin.PULL_UP)

g2_scl = Pin("D8", Pin.OPEN_DRAIN, Pin.PULL_UP)
g2_sda = Pin("D9", Pin.OPEN_DRAIN, Pin.PULL_UP)

g3_scl = Pin("A1", Pin.OPEN_DRAIN, Pin.PULL_UP)
g3_sda = Pin("A0", Pin.OPEN_DRAIN, Pin.PULL_UP)

g4_scl = Pin("A2", Pin.OPEN_DRAIN, Pin.PULL_UP)
g4_sda = Pin("A3", Pin.OPEN_DRAIN, Pin.PULL_UP)

# I2C-Busse erstellen
soft_i2c1 = SoftI2C(scl=g1_scl, sda=g1_sda, freq=100000)  # G1 für Taste A
soft_i2c2 = SoftI2C(scl=g2_scl, sda=g2_sda, freq=100000)  # G2 für Taste S
soft_i2c3 = SoftI2C(scl=g3_scl, sda=g3_sda, freq=100000)  # G3 für Taste D
soft_i2c4 = SoftI2C(scl=g4_scl, sda=g4_sda, freq=100000)  # G4 für Taste F 


# Distanzsensoren initialisieren (mit Fehlerbehandlung)
dist_a = try_init_distance(soft_i2c1, "A")
dist_s = try_init_distance(soft_i2c2, "S")
dist_d = try_init_distance(soft_i2c3, "D")
dist_f = try_init_distance(soft_i2c4, "F")
        

# Pixels initialisieren (ein Pixels-Modul pro Taste)
pixels_a = try_init_pixels(soft_i2c1, "A", NUM_LEDS, LED_AUS)
pixels_s = try_init_pixels(soft_i2c2, "S", NUM_LEDS, LED_AUS)
pixels_d = try_init_pixels(soft_i2c3, "D", NUM_LEDS, LED_AUS)
pixels_f = try_init_pixels(soft_i2c4, "F", NUM_LEDS, LED_AUS)

# =========================
# Prüft ob die Tasten gedrückt werden sollen
# =========================
def distance_to_plate_a():
    if dist_a is None:                                                          #Falls Distanzsensor nicht initialisiert, Taste nicht aktiv
        return False
    distance_cm = dist_a.distance
    if distance_cm < 0 or distance_cm > MAX_GUELTIGE_DISTANZ_CM:                #Falls Distanz ungültig, Taste nicht aktiv
        return False
    return (distance_cm >= MIN_AKTIV_CM) and (distance_cm <= MAX_AKTIV_CM)      #Taste aktiv wenn Distanz im Bereich

def distance_to_plate_s():
    if dist_s is None:                                                          #Falls Distanzsensor nicht initialisiert, Taste nicht aktiv
        return False
    distance_cm = dist_s.distance
    if distance_cm < 0 or distance_cm > MAX_GUELTIGE_DISTANZ_CM:                #Falls Distanz ungültig, Taste nicht aktiv
        return False
    return (distance_cm >= MIN_AKTIV_CM) and (distance_cm <= MAX_AKTIV_CM)      #Taste aktiv wenn Distanz im Bereich

def distance_to_plate_d():
    if dist_d is None:                                                          #Falls Distanzsensor nicht initialisiert, Taste nicht aktiv
        return False
    distance_cm = dist_d.distance
    if distance_cm < 0 or distance_cm > MAX_GUELTIGE_DISTANZ_CM:                #Falls Distanz ungültig, Taste nicht aktiv
        return False
    return (distance_cm >= MIN_AKTIV_CM) and (distance_cm <= MAX_AKTIV_CM)      #Taste aktiv wenn Distanz im Bereich    

def distance_to_plate_f():
    if dist_f is None:                                                          #Falls Distanzsensor nicht initialisiert, Taste nicht aktiv
        return False
    distance_cm = dist_f.distance
    if distance_cm < 0 or distance_cm > MAX_GUELTIGE_DISTANZ_CM:                #Falls Distanz ungültig, Taste nicht aktiv
        return False
    return (distance_cm >= MIN_AKTIV_CM) and (distance_cm <= MAX_AKTIV_CM)      #Taste aktiv wenn Distanz im Bereich

# =========================
# Prüft ob Taste aktiv sind und aktiviert die LEDs
# =========================
def check_keyboard_and_leds():
    active_a = distance_to_plate_a()
    active_s = distance_to_plate_s()
    active_d = distance_to_plate_d()
    active_f = distance_to_plate_f()
    
    # Pixels A (Taste A)
    if pixels_a is not None:                                
        farbe = LED_FARBE if active_a else LED_AUS                  # Pixels wird blau wenn Taste aktiv, sonst aus
        for i in range(NUM_LEDS):
            pixels_a.set_rgb(i, *farbe)
        pixels_a.show()
    
    # Pixels S (Taste S)
    if pixels_s is not None:
        farbe = LED_FARBE if active_s else LED_AUS                  # Pixels wird blau wenn Taste aktiv, sonst aus
        for i in range(NUM_LEDS):
            pixels_s.set_rgb(i, *farbe)
        pixels_s.show()
    
    # Pixels D (Taste D)
    if pixels_d is not None:
        farbe = LED_FARBE if active_d else LED_AUS                  # Pixels wird blau wenn Taste aktiv, sonst aus
        for i in range(NUM_LEDS):   
            pixels_d.set_rgb(i, *farbe)
        pixels_d.show()
    
    # Pixels F (Taste F)
    if pixels_f is not None:
        farbe = LED_FARBE if active_f else LED_AUS                  # Pixels wird blau wenn Taste aktiv, sonst aus
        for i in range(NUM_LEDS):
            pixels_f.set_rgb(i, *farbe)
        pixels_f.show()

# =========================
# Tastatur starten
# =========================
keyboard = KeyboardEmulator()
keyboard.add_binding(distance_to_plate_a, KeyCode.A)                # Bindung der Funktion an Taste A
keyboard.add_binding(distance_to_plate_s, KeyCode.S)                # Bindung der Funktion an Taste S
keyboard.add_binding(distance_to_plate_d, KeyCode.D)                # Bindung der Funktion an Taste D
keyboard.add_binding(distance_to_plate_f, KeyCode.F)                # Bindung der Funktion an Taste F

keyboard.start()

# =========================
# Hauptschleife
# =========================
while True:
    check_keyboard_and_leds()                                       # Überprüfe Tasten und aktualisiere LEDs
    keyboard.update()                                               # Tastatur-Status aktualisieren
    sleep_ms(10)
