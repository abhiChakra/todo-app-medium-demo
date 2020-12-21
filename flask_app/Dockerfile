FROM python:3.7.4

# setting working dir inside container
WORKDIR /to_do_flask_app

COPY ./requirements.txt ./

RUN env && pip install --no-cache-dir -r requirements.txt

COPY ./app.py ./
COPY ./run.py ./
COPY ./storage.py ./
COPY ./db_user.py ./
COPY ./user.py ./

EXPOSE 8080

CMD [ "python", "run.py" ]