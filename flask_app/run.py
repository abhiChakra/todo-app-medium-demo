from app import app
from gevent.pywsgi import WSGIServer

if __name__ == '__main__':
    #app.run(debug=True, host='0.0.0.0', port=5000)
    WSGIServer(('0.0.0.0', 8080), app).serve_forever()