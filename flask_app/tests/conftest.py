import pytest
import app

@pytest.fixture(scope='module')
def test_client():
    flask_app = app.app
    testing_client = flask_app.test_client()
    context = flask_app.app_context()
    context.push()
    yield testing_client
    context.pop()
