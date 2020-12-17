FROM python:3.7.4

# setting working dir inside container
WORKDIR /to_do_flask_app

COPY ./requirements.txt ./

ARG HOST

ENV HOST $HOST

ARG DBNAME

ENV DBNAME $DBNAME

ARG USER

ENV USER $USER

ARG PASS

ENV PASS $PASS

RUN env && pip install --no-cache-dir -r requirements.txt

COPY ./app.py ./
COPY ./run.py ./
COPY ./storage.py ./
COPY ./db_user.py ./
COPY ./user.py ./

COPY ./database.ini ./

EXPOSE 5000

CMD [ "python", "run.py" ]