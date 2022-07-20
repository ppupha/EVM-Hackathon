#run python3 main.py -i localhost -o 5010
from flask import Flask, render_template
from flask_socketio import SocketIO
import argparse
import numpy as np
import base64
import cv2
from detect import *


app = Flask(__name__, template_folder='template')

socketio = SocketIO(app)

lock = False


@app.route('/')
def main():
	return(render_template('index.html'))


@socketio.on('input')
def test_message(img):
	global lock
	if not lock:
		lock = True
		img = base64.b64decode(img.split(",")[1])
		nparr = np.frombuffer(img, np.uint8)
		img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
		re = detect(img)
		socketio.emit('rec', re)
		lock = False
		print(re)


if __name__ == '__main__':
	ap = argparse.ArgumentParser()
	ap.add_argument("-i", "--ip", type=str, required=True)
	ap.add_argument("-o", "--port", type=int, required=True)
	args = vars(ap.parse_args())

	socketio.run(app, port=args["port"])
