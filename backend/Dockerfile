FROM python:3.10-alpine

WORKDIR /home/app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .