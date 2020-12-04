FROM python:3.7.4

# setting working dir inside container
WORKDIR /to_do_flask_app

COPY ./requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt

COPY ./app.py ./
COPY ./run.py ./
COPY ./storage.py ./
COPY ./db_user.py ./
COPY ./user.py ./

COPY ./database.ini ./

ENTRYPOINT /to_do_flask_app/run.py python run.py --host=0.0.0.0 --port=8080