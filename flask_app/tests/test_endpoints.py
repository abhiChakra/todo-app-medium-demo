from io import open
import os
import json
from flask import jsonify

def test_login(test_client):

    credentials = {
        'username' : os.environ['USERNAME'],
        'password' : os.environ['PASSWORD']
    }

    headers = {
         'Content-Type': 'application/json'
    }

    response = test_client.post('/api/login', data=json.dumps(credentials), headers=headers)

    assert response.get_json() == True
    assert response.status_code == 200

def test_logout(test_client):

    response = test_client.post('/api/logout')
    assert response.get_json() == True
    assert response.status_code == 200

