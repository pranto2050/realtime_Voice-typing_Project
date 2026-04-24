import sys
import json
import time
import threading
import pyautogui
import speech_recognition as sr

pyautogui.PAUSE = 0.01

class VoiceEngine:
    def __init__(self):
        self.recognizer = sr.Recognizer()
        self.microphone = sr.Microphone()
        self.is_listening = True
        self.is_paused = False
        self.language = 'en-US'
        
        try:
            with self.microphone as source:
                self.recognizer.adjust_for_ambient_noise(source, duration=1)
        except Exception as e:
            self.send_data({"type": "error", "message": f"Microphone init error: {e}"})

    def send_data(self, data):
        try:
            print(json.dumps(data), flush=True)
        except:
            pass

    def type_text(self, text):
        self.send_data({"type": "status", "status": "typing"})
        pyautogui.write(text + " ")
        self.send_data({"type": "status", "status": "listening"})

    def listen_loop(self):
        self.send_data({"type": "status", "status": "listening"})
        while self.is_listening:
            if self.is_paused:
                time.sleep(0.5)
                continue

            try:
                with self.microphone as source:
                    audio = self.recognizer.listen(source, timeout=1, phrase_time_limit=10)
                    
                    text = self.recognizer.recognize_google(audio, language=self.language)
                    
                    if text:
                        self.send_data({"type": "transcript", "text": text})
                        self.type_text(text)
                        
            except sr.WaitTimeoutError:
                continue
            except sr.UnknownValueError:
                continue
            except sr.RequestError as e:
                self.send_data({"type": "error", "message": f"API Unavailable: {e}"})
                time.sleep(2)
            except Exception as e:
                self.send_data({"type": "error", "message": str(e)})
                time.sleep(1)

    def command_listener(self):
        while self.is_listening:
            try:
                line = sys.stdin.readline()
                if not line:
                    break
                
                cmd = line.strip()
                if cmd == 'PAUSE':
                    self.is_paused = True
                    self.send_data({"type": "status", "status": "paused"})
                elif cmd == 'RESUME':
                    self.is_paused = False
                    self.send_data({"type": "status", "status": "listening"})
                elif cmd.startswith('LANG:'):
                    self.language = cmd.split(':')[1]
            except:
                break
        self.is_listening = False

def main():
    engine = VoiceEngine()
    
    cmd_thread = threading.Thread(target=engine.command_listener, daemon=True)
    cmd_thread.start()
    
    engine.listen_loop()

if __name__ == "__main__":
    main()
