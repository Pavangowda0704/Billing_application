import serial
import time

data = serial.Serial(
                  'COM3',
                  baudrate = 9600,
                  parity=serial.PARITY_NONE,
                  stopbits=serial.STOPBITS_ONE,
                  bytesize=serial.EIGHTBITS,                  
                  timeout=1
                  )

while True:
    d = data.readline()
    d = d.decode('utf-8', 'ignore')
    d = d.strip()
    if d:
        print(d)
    time.sleep(1)